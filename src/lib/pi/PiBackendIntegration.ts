import axios, { AxiosInstance } from "axios"; // Added AxiosInstance type

export type NetworkPassphrase = "Pi Network" | "Pi Testnet";
export type Direction = "user_to_app" | "app_to_user";

type PiNetworkPaymentDTO = {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Object;
  from_address: string;
  to_address: string;
  direction: Direction;
  created_at: string;
  network: NetworkPassphrase;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
};

export type RewardedAdStatusDTO = {
  identifier: string;
  mediator_ack_status: "granted" | "revoked" | "failed" | null;
  mediator_granted_at: string | null;
  mediator_revoked_at: string | null;
};

export class PiNetworkService {
  private baseUrl = "https://api.minepi.com/v2";
  private PiNetworkApi: AxiosInstance;
  private apiKey: string;

  /**
   * Creates an instance of PiNetworkService.
   * @param apiKey Your Pi Network Application API Key. Get this from the Pi Developer Portal.
   * @param walletPrivateSeed (Optional) Your wallet's private seed - ONLY add this if needed for signing transactions on the backend. HANDLE WITH EXTREME CARE.
   */
  static connect() {
    return new PiNetworkService(
      "s4mw8xdg8e6yegj1lxwvllmfvv4zl0zs6rn8oi0rio0hpmj5bzze2ybc1bwbvt5j"
    );
  }
  constructor(apiKey: string /* Add walletPrivateSeed: string if needed */) {
    if (!apiKey) {
      throw new Error("Pi Network API Key is required.");
    }
    this.apiKey = apiKey;
    // this.walletPrivateSeed = walletPrivateSeed; // Uncomment and ensure handling if seed is needed

    // Initialize Axios instance with the provided API key
    this.PiNetworkApi = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        Authorization: "Key " + apiKey,
      },
    });
  }

  async verifyRewardedAd(adId: string): Promise<RewardedAdStatusDTO> {
    try {
      console.log("Verifying ad status for:", adId);
      const APIAnswer = await this.PiNetworkApi.get<RewardedAdStatusDTO>(
        `/ads_network/status/${adId}`
      );
      return APIAnswer.data;
    } catch (error) {
      console.error("Error verifying ad status:", error);
      throw error;
    }
  }

  async authWithPiNetworkApi(accessToken: string): Promise<any> {
    try {
      const APIAnswer = await this.PiNetworkApi.get("/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      return APIAnswer.data;
    } catch (error) {
      console.error("Error authenticating with Pi Network API:", error);
      throw error;
    }
  }

  async approvePiNetworkPayment(paymentId: string): Promise<void> {
    try {
      const approvalResult = await this.PiNetworkApi.post(
        `/payments/${paymentId}/approve`
      );

      console.log(`Payment ${paymentId} approved successfully.`);
    } catch (error) {
      console.error(`Error approving Pi Network payment ${paymentId}:`, error);
      throw error;
    }
  }

  async completePiNetworkPayment(
    paymentId: string,
    transactionId: string
  ): Promise<void> {
    try {
      const completionResponse = await this.PiNetworkApi.post(
        `/payments/${paymentId}/complete`,
        { txid: transactionId }
      );
      console.log(
        `Payment ${paymentId} completed successfully with txid: ${transactionId}.`
      );
    } catch (error) {
      console.error(`Error completing Pi Network payment ${paymentId}:`, error);
      throw error;
    }
  }

  async getPiNetworkPaymentInformation(
    paymentId: string
  ): Promise<PiNetworkPaymentDTO> {
    try {
      const paymentResponse = await this.PiNetworkApi.get<PiNetworkPaymentDTO>(
        `/payments/${paymentId}`
      );
      return paymentResponse.data;
    } catch (error) {
      console.error(
        `Error getting Pi Network payment info for ${paymentId}:`,
        error
      );

      throw error;
    }
  }

  async cancelPiNetworkPayment(paymentId: string): Promise<void> {
    try {
      const paymentCancellingResponse = await this.PiNetworkApi.post(
        `/payments/${paymentId}/cancel`
      );
      console.log(`Payment ${paymentId} cancelled successfully.`);
    } catch (error) {
      console.error(`Error cancelling Pi Network payment ${paymentId}:`, error);
      throw error;
    }
  }

  async cancelPiNetworkIncompletePayment(
    paymentId: string,
    _PiNetworkPaymentDTO: any
  ): Promise<void> {
    console.warn(
      `cancelPiNetworkIncompletePayment called for ${paymentId}. Consider simplifying this method.`
    );
    try {
      const paymentCancellingResponse = await this.PiNetworkApi.post(
        `/payments/${paymentId}/cancel`
      );

      console.log(`Incomplete payment ${paymentId} cancelled successfully.`); // Add success log
    } catch (error) {
      console.error(
        `Error cancelling incomplete Pi Network payment ${paymentId}:`,
        error
      );
      await this.cancelAllPiNetworkIncompletePayments();
      throw error;
    }
  }

  private async cancelAllPiNetworkIncompletePayments(): Promise<void> {
    // Return void
    console.log("Attempting to cancel all incomplete server payments...");
    try {
      const allPiNetworkIncompletePaymentsResponse =
        await this.PiNetworkApi.get<{ incomplete_server_payments: any[] }>( // Add type hint
          "/payments/incomplete_server_payments"
        );

      const incompletePayments: any[] =
        allPiNetworkIncompletePaymentsResponse.data
          ?.incomplete_server_payments || []; // Safer access

      if (incompletePayments.length === 0) {
        console.log("No incomplete server payments found to cancel.");
        return;
      }

      console.log(
        `Found ${incompletePayments.length} incomplete payments to cancel.`
      );

      for (const payment of incompletePayments) {
        const paymentId = payment?.identifier;
        if (paymentId) {
          try {
            console.log(`Cancelling incomplete payment: ${paymentId}`);
            await this.PiNetworkApi.post(`/payments/${paymentId}/cancel`);
            console.log(
              `Successfully cancelled incomplete payment: ${paymentId}`
            );
          } catch (cancelError) {
            console.error(
              `Failed to cancel incomplete payment ${paymentId}:`,
              cancelError
            );
          }
        } else {
          console.warn(
            "Found an incomplete payment entry without an identifier:",
            payment
          );
        }
      }
      console.log("Finished processing incomplete server payments.");
    } catch (error) {
      console.error(
        "Error fetching or cancelling incomplete server payments:",
        error
      );
      throw error;
    }
  }
}

// --- How you should use it ---
/*
// 1. Import the class
import { PiNetworkService } from './path/to/this/file';

// 2. Get your API Key from the Pi Network Developer Portal
const myApiKey = "PASTE_YOUR_API_KEY_HERE";
// const myWalletSeed = "PASTE_WALLET_SEED_HERE"; // Only if needed

// 3. Create an instance of the service
const piService = new PiNetworkService(myApiKey);
// const piServiceWithWallet = new PiNetworkService(myApiKey, myWalletSeed); // If using wallet seed

// 4. Use the methods
async function exampleUsage() {
    try {
        // Example: Get payment info
        const paymentInfo = await piService.getPiNetworkPaymentInformation("some_payment_id");
        console.log(paymentInfo);

        // Example: Approve a payment (replace with actual paymentId)
        // await piService.approvePiNetworkPayment("some_payment_id_to_approve");

        // Example: Verify an Ad (replace with actual adId)
        // const adStatus = await piService.verifyRewardedAd("some_ad_id_token");
        // console.log(adStatus);

    } catch (error) {
        console.error("An error occurred while using PiNetworkService:", error);
    }
}
*/

import axios, { AxiosInstance } from "axios"; // Added AxiosInstance type

export type NetworkPassphrase = "Pi Network" | "Pi Testnet";
export type Direction = "user_to_app" | "app_to_user";

type PiNetworkPaymentDTO = {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
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
    // ❗️Do NOT hardcode a real key in code for production. Use env vars.
    return new PiNetworkService("ekekxxceb2hfmgtoezrwmm9rjjh2vlk5pufwtzv8xtoif5olivlnng7rhowamlbg");
  }

  constructor(apiKey: string /* walletPrivateSeed?: string */) {
    if (!apiKey) {
      throw new Error("Pi Network API Key is required.");
    }
    this.apiKey = apiKey;

    this.PiNetworkApi = axios.create({
      baseURL: this.baseUrl,
      timeout: 20000,
      headers: {
        Authorization: "Key " + apiKey,
      },
    });
  }

  async getRewardedAdStatus(adId: string) {
    try {
      console.log("Verifying ad status for:", adId);
      const APIAnswer = await this.PiNetworkApi.get<RewardedAdStatusDTO>(
        `/ads_network/status/${encodeURIComponent(adId)}`
      );
      return APIAnswer.data;
    } catch (error) {
      console.error("Failed to verify ad status", error);
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
      await this.PiNetworkApi.post(
        `/payments/${encodeURIComponent(paymentId)}/approve`
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
      await this.PiNetworkApi.post(
        `/payments/${encodeURIComponent(paymentId)}/complete`,
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
        `/payments/${encodeURIComponent(paymentId)}`
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
      await this.PiNetworkApi.post(
        `/payments/${encodeURIComponent(paymentId)}/cancel`
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
      await this.PiNetworkApi.post(
        `/payments/${encodeURIComponent(paymentId)}/cancel`
      );
      console.log(`Incomplete payment ${paymentId} cancelled successfully.`);
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
    console.log("Attempting to cancel all incomplete server payments...");
    try {
      const allPiNetworkIncompletePaymentsResponse =
        await this.PiNetworkApi.get<{ incomplete_server_payments: any[] }>(
          "/payments/incomplete_server_payments"
        );

      const incompletePayments: any[] =
        allPiNetworkIncompletePaymentsResponse.data
          ?.incomplete_server_payments || [];

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
            await this.PiNetworkApi.post(
              `/payments/${encodeURIComponent(paymentId)}/cancel`
            );
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

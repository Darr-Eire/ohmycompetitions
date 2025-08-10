'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';

export default function SignupPage() {
  const { user, loginWithPi } = usePiAuth();
  const router = useRouter();

  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (router.query.ref) setReferralCode(router.query.ref);
  }, [router.query.ref]);

  useEffect(() => {
    if (user) router.push('/account');
  }, [user, router]);

  const handleSignup = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (referralCode.trim()) localStorage.setItem('pendingReferralCode', referralCode.trim());
      if (email.trim()) localStorage.setItem('pendingEmail', email.trim());
      if (country.trim()) localStorage.setItem('pendingCountry', country.trim());

      await loginWithPi();

      setMessage('🎉 Account created successfully! Welcome to OhMyCompetitions!');
      setTimeout(() => router.push('/account'), 2000);
    } catch (error) {
      console.error('Signup failed:', error);
      setMessage('❌ Signup failed. Please try again.');
      localStorage.removeItem('pendingReferralCode');
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingCountry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] min-h-screen flex items-center justify-center px-4">
      <div className="bg-[#1e293b] p-8 rounded-2xl border border-cyan-600 shadow-lg shadow-cyan-500/10 max-w-md w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-cyan-400">Join Oh My Competitions</h1>
          <p className="text-cyan-400">Win amazing prizes with Pi Network!</p>
        </div>

        <div className="space-y-4">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              Email Address <span className="text-cyan-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-2">
              Your email is only used to notify you if you win a prize or to send exclusive discounts and voucher codes.
            </p>
          </div>

          {/* Country selector */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            >
              <option value="">Select your country</option>
 
  <option value="Afghanistan">Afghanistan</option>
  <option value="Albania">Albania</option>
  <option value="Algeria">Algeria</option>
  <option value="Andorra">Andorra</option>
  <option value="Angola">Angola</option>
  <option value="Antigua and Barbuda">Antigua and Barbuda</option>
  <option value="Argentina">Argentina</option>
  <option value="Armenia">Armenia</option>
  <option value="Australia">Australia</option>
  <option value="Austria">Austria</option>
  <option value="Azerbaijan">Azerbaijan</option>
  <option value="Bahamas">Bahamas</option>
  <option value="Bahrain">Bahrain</option>
  <option value="Bangladesh">Bangladesh</option>
  <option value="Barbados">Barbados</option>
  <option value="Belarus">Belarus</option>
  <option value="Belgium">Belgium</option>
  <option value="Belize">Belize</option>
  <option value="Benin">Benin</option>
  <option value="Bhutan">Bhutan</option>
  <option value="Bolivia">Bolivia</option>
  <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
  <option value="Botswana">Botswana</option>
  <option value="Brazil">Brazil</option>
  <option value="Brunei">Brunei</option>
  <option value="Bulgaria">Bulgaria</option>
  <option value="Burkina Faso">Burkina Faso</option>
  <option value="Burundi">Burundi</option>
  <option value="Cabo Verde">Cabo Verde</option>
  <option value="Cambodia">Cambodia</option>
  <option value="Cameroon">Cameroon</option>
  <option value="Canada">Canada</option>
  <option value="Central African Republic">Central African Republic</option>
  <option value="Chad">Chad</option>
  <option value="Chile">Chile</option>
  <option value="China">China</option>
  <option value="Colombia">Colombia</option>
  <option value="Comoros">Comoros</option>
  <option value="Congo (Brazzaville)">Congo (Brazzaville)</option>
  <option value="Congo (Kinshasa)">Congo (Kinshasa)</option>
  <option value="Costa Rica">Costa Rica</option>
  <option value="Croatia">Croatia</option>
  <option value="Cuba">Cuba</option>
  <option value="Cyprus">Cyprus</option>
  <option value="Czech Republic">Czech Republic</option>
  <option value="Denmark">Denmark</option>
  <option value="Djibouti">Djibouti</option>
  <option value="Dominica">Dominica</option>
  <option value="Dominican Republic">Dominican Republic</option>
  <option value="Ecuador">Ecuador</option>
  <option value="Egypt">Egypt</option>
  <option value="El Salvador">El Salvador</option>
  <option value="Equatorial Guinea">Equatorial Guinea</option>
  <option value="Eritrea">Eritrea</option>
  <option value="Estonia">Estonia</option>
  <option value="Eswatini">Eswatini</option>
  <option value="Ethiopia">Ethiopia</option>
  <option value="Fiji">Fiji</option>
  <option value="Finland">Finland</option>
  <option value="France">France</option>
  <option value="Gabon">Gabon</option>
  <option value="Gambia">Gambia</option>
  <option value="Georgia">Georgia</option>
  <option value="Germany">Germany</option>
  <option value="Ghana">Ghana</option>
  <option value="Greece">Greece</option>
  <option value="Grenada">Grenada</option>
  <option value="Guatemala">Guatemala</option>
  <option value="Guinea">Guinea</option>
  <option value="Guinea-Bissau">Guinea-Bissau</option>
  <option value="Guyana">Guyana</option>
  <option value="Haiti">Haiti</option>
  <option value="Honduras">Honduras</option>
  <option value="Hungary">Hungary</option>
  <option value="Iceland">Iceland</option>
  <option value="India">India</option>
  <option value="Indonesia">Indonesia</option>
  <option value="Iran">Iran</option>
  <option value="Iraq">Iraq</option>
  <option value="Ireland">Ireland</option>
  <option value="Israel">Israel</option>
  <option value="Italy">Italy</option>
  <option value="Jamaica">Jamaica</option>
  <option value="Japan">Japan</option>
  <option value="Jordan">Jordan</option>
  <option value="Kazakhstan">Kazakhstan</option>
  <option value="Kenya">Kenya</option>
  <option value="Kiribati">Kiribati</option>
  <option value="Kuwait">Kuwait</option>
  <option value="Kyrgyzstan">Kyrgyzstan</option>
  <option value="Laos">Laos</option>
  <option value="Latvia">Latvia</option>
  <option value="Lebanon">Lebanon</option>
  <option value="Lesotho">Lesotho</option>
  <option value="Liberia">Liberia</option>
  <option value="Libya">Libya</option>
  <option value="Liechtenstein">Liechtenstein</option>
  <option value="Lithuania">Lithuania</option>
  <option value="Luxembourg">Luxembourg</option>
  <option value="Madagascar">Madagascar</option>
  <option value="Malawi">Malawi</option>
  <option value="Malaysia">Malaysia</option>
  <option value="Maldives">Maldives</option>
  <option value="Mali">Mali</option>
  <option value="Malta">Malta</option>
  <option value="Marshall Islands">Marshall Islands</option>
  <option value="Mauritania">Mauritania</option>
  <option value="Mauritius">Mauritius</option>
  <option value="Mexico">Mexico</option>
  <option value="Micronesia">Micronesia</option>
  <option value="Moldova">Moldova</option>
  <option value="Monaco">Monaco</option>
  <option value="Mongolia">Mongolia</option>
  <option value="Montenegro">Montenegro</option>
  <option value="Morocco">Morocco</option>
  <option value="Mozambique">Mozambique</option>
  <option value="Myanmar">Myanmar</option>
  <option value="Namibia">Namibia</option>
  <option value="Nauru">Nauru</option>
  <option value="Nepal">Nepal</option>
  <option value="Netherlands">Netherlands</option>
  <option value="New Zealand">New Zealand</option>
  <option value="Nicaragua">Nicaragua</option>
  <option value="Niger">Niger</option>
  <option value="Nigeria">Nigeria</option>
  <option value="North Korea">North Korea</option>
  <option value="North Macedonia">North Macedonia</option>
  <option value="Norway">Norway</option>
  <option value="Oman">Oman</option>
  <option value="Pakistan">Pakistan</option>
  <option value="Palau">Palau</option>
  <option value="Panama">Panama</option>
  <option value="Papua New Guinea">Papua New Guinea</option>
  <option value="Paraguay">Paraguay</option>
  <option value="Peru">Peru</option>
  <option value="Philippines">Philippines</option>
  <option value="Poland">Poland</option>
  <option value="Portugal">Portugal</option>
  <option value="Qatar">Qatar</option>
  <option value="Romania">Romania</option>
  <option value="Russia">Russia</option>
  <option value="Rwanda">Rwanda</option>
  <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
  <option value="Saint Lucia">Saint Lucia</option>
  <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
  <option value="Samoa">Samoa</option>
  <option value="San Marino">San Marino</option>
  <option value="Sao Tome and Principe">Sao Tome and Principe</option>
  <option value="Saudi Arabia">Saudi Arabia</option>
  <option value="Senegal">Senegal</option>
  <option value="Serbia">Serbia</option>
  <option value="Seychelles">Seychelles</option>
  <option value="Sierra Leone">Sierra Leone</option>
  <option value="Singapore">Singapore</option>
  <option value="Slovakia">Slovakia</option>
  <option value="Slovenia">Slovenia</option>
  <option value="Solomon Islands">Solomon Islands</option>
  <option value="Somalia">Somalia</option>
  <option value="South Africa">South Africa</option>
  <option value="South Korea">South Korea</option>
  <option value="South Sudan">South Sudan</option>
  <option value="Spain">Spain</option>
  <option value="Sri Lanka">Sri Lanka</option>
  <option value="Sudan">Sudan</option>
  <option value="Suriname">Suriname</option>
  <option value="Sweden">Sweden</option>
  <option value="Switzerland">Switzerland</option>
  <option value="Syria">Syria</option>
  <option value="Taiwan">Taiwan</option>
  <option value="Tajikistan">Tajikistan</option>
  <option value="Tanzania">Tanzania</option>
  <option value="Thailand">Thailand</option>
  <option value="Timor-Leste">Timor-Leste</option>
  <option value="Togo">Togo</option>
  <option value="Tonga">Tonga</option>
  <option value="Trinidad and Tobago">Trinidad and Tobago</option>
  <option value="Tunisia">Tunisia</option>
  <option value="Turkey">Turkey</option>
  <option value="Turkmenistan">Turkmenistan</option>
  <option value="Tuvalu">Tuvalu</option>
  <option value="Uganda">Uganda</option>
  <option value="Ukraine">Ukraine</option>
  <option value="United Arab Emirates">United Arab Emirates</option>
  <option value="United Kingdom">United Kingdom</option>
  <option value="United States">United States</option>
  <option value="Uruguay">Uruguay</option>
  <option value="Uzbekistan">Uzbekistan</option>
  <option value="Vanuatu">Vanuatu</option>
  <option value="Vatican City">Vatican City</option>
  <option value="Venezuela">Venezuela</option>
  <option value="Vietnam">Vietnam</option>
  <option value="Yemen">Yemen</option>
  <option value="Zambia">Zambia</option>
  <option value="Zimbabwe">Zimbabwe</option>
            </select>
          </div>

          {/* Referral input */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              Referral Code (Optional)
            </label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="Enter referral code (e.g., ABC12345)"
              className="w-full px-4 py-3 bg-[#0f172a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              maxLength={10}
            />
            {router.query.ref && (
              <p className="text-xs text-green-400 mt-1">✅ Referral code detected from link</p>
            )}
          </div>

        {/* Referral promo (UPDATED) */}
<div className="bg-[#0f172a] p-4 rounded-lg border border-green-500/30">
  <h3 className="text-green-400 font-semibold mb-2">🏆 Referral Rewards</h3>
  <ul className="text-sm text-gray-300 space-y-1">
    <li>
      • Refer friends and get 1 extra entry
       into our <span className="text-cyan-300 font-semibold">current Free Competition</span>.
    </li>
    <li>
      • Every successful referral = <span className="text-white font-semibold">one extra free entry</span>.
    </li>
    <li>
      • Your friend also starts with <span className="text-white font-semibold">a free entry ticket</span>
    </li>
    <li className="text-xs text-gray-400 mt-1">
      * Free competition changes regularly — check the homepage for details.
    </li>
  </ul>
</div>

        </div>

        {/* Signup button */}
        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              Creating Account...
            </span>
          ) : (
            'Sign Up with Pi Network'
          )}
        </button>

        {/* Message feedback */}
        {message && (
          <div
            className={`p-3 rounded-lg text-center text-sm ${
              message.includes('❌')
                ? 'bg-red-900/20 border border-red-500 text-red-400'
                : 'bg-green-900/20 border border-green-500 text-green-400'
            }`}
          >
            {message}
          </div>
        )}

        {/* Extra Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-400">
            By signing up, you agree to our terms and conditions
          </p>
          <p className="text-xs text-cyan-400">
            Already have an account?{' '}
            <button onClick={() => router.push('/account')} className="underline hover:text-cyan-300">
              Sign In
            </button>
          </p>
        </div>

        {/* Expandable info */}
        <details className="bg-[#0f172a] rounded-lg border border-gray-600">
          <summary className="p-3 text-sm text-cyan-400 cursor-pointer hover:text-cyan-300">
            ℹ️ How Pi Network Signup Works
          </summary>
          <div className="p-3 pt-0 text-xs text-gray-300 space-y-1">
            <p>• Enter your email and (optionally) a referral code</p>
            <p>• Select your country</p>
            <p>• Click "Sign Up with Pi Network"</p>
            <p>• Authenticate using your Pi Network account</p>
            <p>• You're in!</p>
          </div>
        </details>
      </div>
    </div>
  );
}

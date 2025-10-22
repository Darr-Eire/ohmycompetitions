'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { usePiAuth } from '../context/PiAuthContext';

export default function SignupPage() {
  const { user, loginWithPi, sdkReady, loading: authLoading, error: authError } = usePiAuth();
  const router = useRouter();

  const [referralCode, setReferralCode] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Prefill referral from ?ref=
  useEffect(() => {
    const r = router?.query?.ref;
    if (r && typeof r === 'string') setReferralCode(r.toUpperCase().slice(0, 10));
  }, [router?.query?.ref]);

  // Redirect if already signed in
  useEffect(() => {
    if (user) router.push('/homepage');
  }, [user, router]);

  const emailOk = useMemo(() => {
    if (!email.trim()) return true; // optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  async function handleSignup() {
    if (loading || authLoading) return;
    if (!country) {
      setMessage('❌ Please select your country.');
      return;
    }
    if (!emailOk) {
      setMessage('❌ Please enter a valid email address (or leave blank).');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      // Cache optional pre-auth data
      if (referralCode.trim()) localStorage.setItem('pendingReferralCode', referralCode.trim().toUpperCase());
      if (email.trim()) localStorage.setItem('pendingEmail', email.trim());
      if (country.trim()) localStorage.setItem('pendingCountry', country.trim());

      // Ensure Pi SDK is ready if needed
      if (!sdkReady && typeof window !== 'undefined') {
        if (typeof window.__readyPi === 'function') {
          try { await window.__readyPi(); } catch {/* no-op */}
        }
      }

      await loginWithPi();

      setMessage('🎉 Account created successfully! Welcome to OhMyCompetitions!');
      setTimeout(() => router.push('/homepage'), 1200);
    } catch (err) {
      console.error('Signup failed:', err);
      setMessage('❌ Signup failed. Please try again.');
      localStorage.removeItem('pendingReferralCode');
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingCountry');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070c1a] via-[#0f172a] to-[#081425] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-[#0b1220] p-6 shadow-[0_0_40px_#22d3ee33]">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-3xl font-bold text-cyan-300">Join Oh My Competitions</h1>
          <p className="text-cyan-400/90">Win amazing prizes with Pi Network!</p>
        </div>

        <div className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-1.5">
              Email Address <span className="font-normal text-cyan-400">(Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full rounded-lg border bg-[#081425] px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2
                ${emailOk ? 'border-white/15 focus:ring-cyan-400' : 'border-rose-500/60 focus:ring-rose-400'}`}
            />
            <p className="mt-2 text-xs text-white/50">
              Used to notify you if you win and to send exclusive discounts/vouchers. We don’t spam.
            </p>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-1.5">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#081425] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-400"
              required
            >
              <option value="">Select your country</option>
              {/* Your list preserved */}
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

          {/* Referral */}
          <div>
            <label className="block text-sm font-semibold text-cyan-300 mb-1.5">Referral Code (Optional)</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="Enter referral (e.g., ABC12345)"
              className="w-full rounded-lg border border-white/15 bg-[#081425] px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-cyan-400"
              maxLength={10}
            />
            {router?.query?.ref ? (
              <p className="mt-1 text-xs text-emerald-300">✅ Referral code detected from link</p>
            ) : null}
          </div>

          {/* Referral Promo */}
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/5 p-4">
            <h3 className="mb-2 font-semibold text-emerald-300">🏆 Referral Rewards</h3>
            <ul className="space-y-1 text-sm text-white/80">
              <li>• Refer friends and get 1 extra entry into our <span className="font-semibold text-cyan-300">current Free Competition</span>.</li>
              <li>• Every successful referral = <span className="font-semibold text-white">one extra free entry</span>.</li>
              <li>• Your friend also starts with <span className="font-semibold text-white">a free entry ticket</span>.</li>
              <li className="mt-1 text-xs text-white/50">* Free competition changes regularly — check the homepage for details.</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSignup}
          disabled={loading || authLoading}
          className={`mt-6 w-full rounded-lg px-4 py-3 font-extrabold text-black shadow-[0_8px_24px_#22d3ee55]
            bg-gradient-to-r from-[#00ffd5] to-[#0077ff] hover:brightness-110 active:brightness-110
            focus:outline-none focus:ring-2 focus:ring-cyan-300/70
            disabled:opacity-60 disabled:cursor-not-allowed`}
          title={!sdkReady ? 'Loading Pi SDK… Open in Pi Browser' : 'Sign Up with Pi Network'}
        >
          {(loading || authLoading) ? (
            <span className="inline-flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Creating Account…
            </span>
          ) : (
            'Sign Up with Pi Network'
          )}
        </button>

        {/* Feedback */}
        {(message || authError) && (
          <div
            className={`mt-3 rounded-lg p-3 text-center text-sm
              ${(message && message.includes('❌')) || authError
                ? 'border border-rose-500/60 bg-rose-500/10 text-rose-300'
                : 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-300'}`}
          >
            {authError ? `❌ ${authError}` : message}
          </div>
        )}

        {/* Footer links */}
        <div className="mt-5 space-y-2 text-center">
          <p className="text-xs text-white/50">
            By signing up, you agree to our terms and conditions.
          </p>
          <p className="text-xs text-cyan-300">
            Already have an account?{' '}
            <button onClick={() => router.push('/account')} className="underline hover:text-cyan-200">
              Sign In
            </button>
          </p>
        </div>

        {/* Info accordion */}
        <details className="mt-4 rounded-lg border border-white/10 bg-[#081425]">
          <summary className="cursor-pointer p-3 text-sm text-cyan-300 hover:text-cyan-200">
            ℹ️ How Pi Network Signup Works
          </summary>
          <div className="space-y-1 p-3 pt-0 text-xs text-white/70">
            <p>• Enter your email and (optionally) a referral code</p>
            <p>• Select your country</p>
            <p>• Click “Sign Up with Pi Network”</p>
            <p>• Authenticate using your Pi Network account</p>
            <p>• You’re in!</p>
          </div>
        </details>
      </div>
    </div>
  );
}

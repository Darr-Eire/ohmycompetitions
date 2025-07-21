'use client'

import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <main className="page text-white">
      <div className="competition-card max-w-3xl w-full mx-auto">
        {/* Title */}
        <div className="competition-top-banner text-center text-xl sm:text-2xl font-bold my-4 !text-cyan-300">
          Privacy Policy
        </div>

        {/* Divider */}
        <div className="h-1 w-24 bg-blue-300 mx-auto rounded mb-6" />

        {/* Body */}
        <div className="p-6 space-y-6 text-center">
          <p className="text-white">
            This Privacy Policy ("Policy") explains how OhMyCompetitions ("we", "us", "our") collects, uses, shares, and protects your personal information. We are committed to protecting your privacy and complying with all applicable privacy and data protection laws worldwide, including GDPR, CCPA, and Pi Network guidelines.
          </p>

          {[
            {
              title: '1. Information We Collect',
              points: [
                'Pi Network UID, username, and profile data (via secure Pi SDK authentication).',
                'Optional email address (if provided during support, feedback, or prize claims).',
                'Competition-related data, such as ticket purchases, wins, rankings, and activity logs.',
                'Device and technical information (IP address, device type, operating system, browser type) for security and performance analytics.',
                'Basic engagement metrics (e.g., pages viewed, interaction patterns) to improve services.'
              ]
            },
            {
              title: '2. How We Use Your Information',
              points: [
                'To operate competitions, verify eligibility, deliver prizes, and contact winners.',
                'To detect and prevent fraud, abuse, or violations of our Terms & Conditions.',
                'To analyze platform performance, improve services, and develop new features.',
                'To comply with legal obligations, resolve disputes, or enforce our policies.',
                'To maintain the security and integrity of our platform and user accounts.'
              ]
            },
            {
              title: '3. Data Security and Protection',
              points: [
                'We implement advanced security measures, including encryption, access controls, and secure server infrastructure.',
                'Access to personal data is restricted to authorized personnel on a strict need-to-know basis.',
                'We do not store, access, or manage your Pi wallet balances or private keys under any circumstances.',
                'Regular audits and security reviews are performed to identify and mitigate risks.'
              ]
            },
            {
              title: '4. Sharing and Disclosure',
              points: [
                'We do not sell, rent, or trade your personal information to any third parties.',
                'We may share data internally for legitimate business or technical purposes only.',
                'Information may be disclosed if required by law, regulatory authorities, or to protect our rights, users, and community.',
                'In case of a business transfer (e.g., merger or acquisition), your data may be transferred in compliance with applicable laws and this Policy.'
              ]
            },
            {
              title: '5. Cookies and Tracking Technologies',
              points: [
                'We use minimal, privacy-respecting cookies to enable login sessions, maintain user preferences, and secure platform access.',
                'We do not use invasive advertising trackers or third-party behavioral tracking.',
                'You can manage or disable cookies in your browser settings; however, some platform functionalities may be affected.'
              ]
            },
            {
              title: '6. Your Rights and Choices',
              points: [
                'You have the right to access, correct, update, or request deletion of your personal data.',
                'EU/EEA residents have additional rights under GDPR, including data portability and the right to restrict or object to processing.',
                'California residents have specific rights under CCPA, including the right to know, delete, and opt-out of certain uses of personal information.',
                <>
                  To exercise these rights, please email us at{' '}
                  <span className="text-cyan-300">ohmycompetitions@gmail.com</span>.
                </>
              ]
            },
            {
              title: '7. Data Retention',
              points: [
                'We retain personal data only as long as necessary to fulfill the purposes outlined in this Policy, comply with legal obligations, and protect our interests.',
                'Upon verified request, we will delete or anonymize your personal data unless we are legally obligated to retain it.'
              ]
            },
            {
              title: '8. International Data Transfers',
              points: [
                'Your data may be transferred to and processed in countries other than your own, where privacy laws may differ.',
                'We ensure adequate safeguards are in place (such as standard contractual clauses) to protect your data in accordance with applicable laws.'
              ]
            },
            {
              title: '9. Children’s Privacy',
              points: [
                'Our services are not directed to or intended for children under the age of 18 or the age of majority in their jurisdiction.',
                'We do not knowingly collect personal information from children. If we become aware, we will promptly delete such data.'
              ]
            },
            {
              title: '10. Pi Network Compliance',
              points: [
                'We fully adhere to Pi Network Developer Guidelines and the ecosystem’s best practices.',
                'We do not interact directly with your Pi wallet, nor do we store or request private keys.',
                'Prizes are awarded in Pi, or equivalent value in Pi, consistent with our Terms & Conditions.'
              ]
            },
            {
              title: '11. Changes to This Policy',
              points: [
                'We may update this Policy to reflect changes in laws, technology, or our practices.',
                'We will notify users of significant changes via app updates, in-app announcements, or email where appropriate.',
                'Continued use of our services after updates indicates your acceptance of the revised Policy.'
              ]
            }
          ].map((section, index) => (
            <div key={index}>
              <h2 className="font-semibold text-cyan-300 mt-6">{section.title}</h2>
              <ul className="list-disc list-inside mt-2 text-white text-left max-w-xl mx-auto">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <h2 className="font-semibold text-cyan-300 mt-6">12. Contact Us</h2>
          <p>
            If you have any questions, requests, or concerns about this Privacy Policy or your data, please contact us at{' '}
            <span className="text-cyan-300">ohmycompetitions@gmail.com</span>.
          </p>

          {/* Back Home Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

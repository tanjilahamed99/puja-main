import Topbar from '@/components/admin/Topbar';
import PageHeader from '@/components/admin/PageHeader';
import { Award } from 'lucide-react';

const certificates = [
  {
    id: 1,
    course: 'Satyanarayan Puja Vidhi',
    certificateNumber: 'CERT-2026-8F3A2C',
    issuedAt: 'Jul 20, 2026',
  },
];

export default function CertificatesPage() {
  return (
    <>
      <Topbar title="Certificates" subtitle="Earned by completing a subscription course" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="My Certificates"
          description="A certificate is issued automatically once a course is marked complete."
        />

        {certificates.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-inkSoft text-sm">
            No certificates yet — complete a course to earn one.
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-goldSoft/40 text-maroon p-3 rounded-lg">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">{cert.course}</h3>
                    <p className="text-sm text-inkSoft mt-0.5">
                      {cert.certificateNumber} · Issued {cert.issuedAt}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  title="PDF generation is coming soon"
                  className="text-sm font-medium text-inkSoft border border-border px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
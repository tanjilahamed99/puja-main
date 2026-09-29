"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/admin/Topbar";
import PageHeader from "@/components/admin/PageHeader";
import { Award } from "lucide-react";
import { getMyCertificates } from "@/action/student";
import { formatDate } from "@/components/formatDate";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await getMyCertificates();
        setCertificates(data.certificates || []);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Could not load your certificates. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Topbar title="Certificates" subtitle="Earned by completing a subscription course" />
      <main className="px-6 lg:px-10 py-8">
        <PageHeader
          title="My Certificates"
          description="A certificate is issued automatically once a course is marked complete."
        />

        {loading && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-inkSoft text-sm">
            Loading your certificates…
          </div>
        )}

        {!loading && error && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-danger text-sm">
            {error}
          </div>
        )}

        {!loading && !error && certificates.length === 0 && (
          <div className="bg-surface border border-border rounded-xl p-8 text-center text-inkSoft text-sm">
            No certificates yet — complete a course to earn one.
          </div>
        )}

        {!loading && !error && certificates.length > 0 && (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert._id}
                className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-goldSoft/40 text-maroon p-3 rounded-lg">
                    <Award size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold">
                      {cert.course?.title || "Course removed"}
                    </h3>
                    <p className="text-sm text-inkSoft mt-0.5">
                      {cert.certificateNumber} · Issued {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                </div>

                {cert.pdfUrl ? (
                  <a
                    href={cert.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-maroon border border-border px-4 py-2 rounded-lg hover:border-maroon transition-colors"
                  >
                    Download PDF
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="PDF generation is coming soon"
                    className="text-sm font-medium text-inkSoft border border-border px-4 py-2 rounded-lg cursor-not-allowed"
                  >
                    Download PDF
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
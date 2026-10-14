import Link from "next/link";
import IllustrationForm from "@/components/admin/IllustrationForm";

export default function NewIllustrationPage() {
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/illustrations" className="crumb">← Illustrations</Link>
          <h1>New illustration</h1>
        </div>
      </div>
      <IllustrationForm initial={{ title: "", caption: "", imageId: null, color: "violet", published: true }} />
    </>
  );
}

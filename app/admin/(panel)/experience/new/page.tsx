import Link from "next/link";
import ExperienceForm from "@/components/admin/ExperienceForm";

export default function NewExperiencePage() {
  return (
    <>
      <div className="page-head">
        <div>
          <Link href="/admin/experience" className="crumb">← Experience</Link>
          <h1>Add experience</h1>
        </div>
      </div>
      <ExperienceForm
        initial={{
          role: "", company: "", companyLogoId: null, companyUrl: "", employmentType: "", location: "",
          locationType: "", startMonth: null, startYear: null, endMonth: null, endYear: null, isCurrent: false,
          description: "", skills: [], published: true,
        }}
      />
    </>
  );
}

import React from "react";
import { Person } from "../types";

interface Props {
  person: Person;
}

const ViewPersonProfile: React.FC<Props> = ({ person }) => {
  const skills = person.skills ?? [];

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "";
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const getUniqueSocials = () => {
    const socials = [...(person.socialProfiles || [])];
    if (
      person.linkedinUrl &&
      !socials.find((s) => s.platform.toLowerCase() === "linkedin")
    ) {
      socials.unshift({ platform: "LinkedIn", url: person.linkedinUrl });
    }
    return socials;
  };

  const uniqueSocials = getUniqueSocials();

  return (
    <div className="h-full bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-gray-100">
        <img
          src={
            person.avatar ||
            `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=007aff&color=fff`
          }
          alt={`${person.firstName} ${person.lastName}`}
          className="h-32 w-32 rounded-2xl object-cover shadow-lg border-2 border-white ring-1 ring-black/5"
        />
        <div className="text-center md:text-left flex-1">
          <h2 className="text-3xl font-black text-[#1d1d1f] tracking-tight">
            {person.firstName} {person.lastName}
          </h2>
          <p className="text-lg text-[#007aff] font-semibold mt-1">
            {person.position}
          </p>
          <p className="text-[#86868b] font-medium text-sm uppercase tracking-wider mt-1">
            {person.company} • {person.location || "Remote"}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            {uniqueSocials.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] text-xs font-bold rounded-full transition-colors border border-black/[0.03]"
              >
                <span
                  className={`w-2 h-2 rounded-full ${social.platform.toLowerCase() === "linkedin" ? "bg-[#0077b5]" : "bg-gray-400"}`}
                />
                {social.platform}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Experience & Bio */}
        <div className="lg:col-span-2 space-y-12">
          {person.bio && (
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                About
              </h3>
              <p className="text-[#424245] leading-relaxed text-[15px]">
                {person.bio}
              </p>
            </section>
          )}

          {person.experience && person.experience.length > 0 && (
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                Experience
              </h3>
              <div className="space-y-8 relative before:absolute before:inset-0 before:left-[7px] before:w-px before:bg-gray-100">
                {person.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white border-2 border-[#007aff] z-10" />
                    <h4 className="font-bold text-[#1d1d1f] text-base leading-none">
                      {exp.position}
                    </h4>
                    <p className="text-[#007aff] text-sm font-semibold mt-1">
                      {exp.company}
                    </p>
                    <p className="text-xs font-medium text-[#86868b] mt-1">
                      {formatDate(exp.startDate)} —{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="mt-3 text-[13px] text-[#424245] leading-relaxed bg-gray-50 p-3 rounded-lg border border-black/[0.02]">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Education & Skills */}
        <div className="space-y-12">
          {person.education && person.education.length > 0 && (
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                Education
              </h3>
              <div className="space-y-6">
                {person.education.map((edu) => (
                  <div key={edu.id} className="group">
                    <h4 className="font-bold text-[#1d1d1f] text-sm group-hover:text-[#007aff] transition-colors">
                      {edu.institution}
                    </h4>
                    <p className="text-xs text-[#424245] font-medium mt-0.5">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-[11px] text-[#86868b] mt-1 font-bold">
                      Class of{" "}
                      {edu.endDate
                        ? new Date(edu.endDate).getFullYear()
                        : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-black/10 text-[#1d1d1f] text-[11px] font-bold rounded-md shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPersonProfile;

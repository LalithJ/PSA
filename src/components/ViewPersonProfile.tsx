import React from "react";
import { Person } from "../types";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";

interface Props {
  person: Person;
}

const ViewPersonProfile: React.FC<Props> = ({ person }) => {
  // Defensive check for skills
  const skills = person.skills ?? [];

  // FIXED: Defensive date formatting to handle strings or date objects
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "";
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const uniqueSocials = (() => {
    const socials = [...(person.socialProfiles || [])];
    if (
      person.linkedinUrl &&
      !socials.find((s) => s.platform.toLowerCase() === "linkedin")
    ) {
      socials.unshift({ platform: "LinkedIn", url: person.linkedinUrl });
    }
    return socials;
  })();

  return (
    <div className="bg-white text-[#1A1A1A] antialiased p-8 max-w-5xl mx-auto shadow-sm min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-gray-100">
        <div className="relative group">
          <img
            src={
              person.avatar ||
              `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=f3f4f6&color=1a1a1a`
            }
            alt={`${person.firstName} ${person.lastName}`}
            className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover border border-gray-200 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className="flex-1 text-center md:text-left min-w-0">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 leading-none mb-2">
            {person.firstName} {person.lastName}
          </h2>
          <p className="text-[16px] font-semibold text-gray-700 mb-1">
            {person.position}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1 text-[13px] text-gray-500 font-medium">
            <span className="text-gray-900">{person.company}</span>
            <span className="hidden md:inline text-gray-300">•</span>
            <span className="flex items-center gap-1">
              <GlobeAltIcon className="h-4 w-4 text-gray-400" />
              {person.location || "Remote"}
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-6">
            {uniqueSocials.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-white text-[11px] font-bold rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    social.platform.toLowerCase() === "linkedin"
                      ? "bg-blue-600"
                      : "bg-gray-400"
                  }`}
                />
                <span className="text-gray-700">{social.platform}</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Main Content Column */}
        <div className="md:col-span-8 space-y-10">
          {/* Bio Section */}
          {person.bio && (
            <section className="bg-blue-50/30 rounded-2xl p-6 border border-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600/70">
                  Professional Summary
                </h3>
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed italic font-medium">
                "{person.bio}"
              </p>
            </section>
          )}

          {/* Work History Section */}
          {person.experiences && person.experiences.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Work History
                </h3>
              </div>
              <div className="space-y-6 border-l-[1.5px] border-gray-100 ml-2">
                {person.experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-8 group">
                    {/* Timeline Node */}
                    <div
                      className={`absolute -left-[9.5px] top-1.5 h-[17px] w-[17px] rounded-full bg-white border-[3px] transition-colors duration-200 ${
                        exp.current
                          ? "border-blue-600 scale-110 shadow-sm"
                          : "border-gray-200 group-hover:border-gray-400"
                      }`}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-1">
                      <h4 className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight">
                        {exp.position}
                      </h4>
                      <span className="text-[11px] font-bold text-gray-400 tabular-nums uppercase bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                        {formatDate(exp.startDate)} –{" "}
                        {exp.current
                          ? "Present"
                          : exp.endDate
                            ? formatDate(exp.endDate)
                            : ""}
                      </span>
                    </div>

                    <p className="text-[13px] font-bold text-blue-600/80 mb-3">
                      {exp.company}
                    </p>

                    {exp.description && (
                      <p className="text-[13px] text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 hover:bg-gray-50 transition-colors">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="md:col-span-4 space-y-10">
          {/* Education Section */}
          {person.education && person.education.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Education
                </h3>
              </div>
              <div className="space-y-5">
                {person.education.map((edu) => (
                  <div key={edu.id} className="group">
                    <h4 className="text-[14px] font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {edu.institution}
                    </h4>
                    <p className="text-[12px] text-gray-600 mt-1 font-medium">
                      {edu.degree}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-semibold italic">
                      {edu.field}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Expertise
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[10.5px] font-bold rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-gray-300 hover:shadow-sm transition-all"
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

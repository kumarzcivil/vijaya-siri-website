import { useEffect, useRef } from 'react';
import './TermsPage.css';

const LAST_UPDATED = 'August 2026';
const PHONE = '+91 90088 55088';
const EMAIL = 'info@vijayasiri.com';

interface TermsSection {
  id: string;
  title: string;
  paragraphs: string[];
}

const termsSections: TermsSection[] = [
  {
    id: 'about',
    title: 'About Vijaya Siri',
    paragraphs: [
      'Vijaya Siri provides residential construction, renovation, interior design and related building services. These Terms govern the use of this website and the general framework within which Vijaya Siri offers its services.',
      'Pricing, payment milestones, project-specific commercial conditions and detailed scope definitions are governed by the applicable quotation, work order and Pricing Policies rather than this general overview.',
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    paragraphs: [
      'By using this website or engaging with our services, you confirm that you are at least 18 years of age and have the legal capacity to enter into a binding agreement.',
      'If you are acting on behalf of a company, partnership or other legal entity, you confirm that you have the authority to bind that entity to these Terms.',
    ],
  },
  {
    id: 'website-information',
    title: 'Website Information',
    paragraphs: [
      'Information on this website is provided for general informational purposes. While Vijaya Siri aims to keep information accurate and current, specifications, prices, availability, images and other details may change without prior notice.',
      'Website content should not be treated as a substitute for a project-specific quotation, architectural or engineering assessment, approved drawing or other project documentation.',
    ],
  },
  {
    id: 'quotations-pricing',
    title: 'Quotations & Pricing',
    paragraphs: [
      'Package prices and per sq.ft. rates displayed on the website are indicative unless specifically confirmed in a project quotation.',
      'Final pricing depends on project requirements, accurate measurements, specifications, material selections, site conditions, design complexity, applicable taxes and other factors determined during the project assessment.',
      'A quotation provided by Vijaya Siri is valid for the period stated in the quotation. Quotations not accepted within the stated period may be subject to revision.',
    ],
  },
  {
    id: 'scope-of-work',
    title: 'Scope of Work',
    paragraphs: [
      'The scope of work for each project is defined by the approved quotation, work order or agreement specific to that project.',
      'Work outside the agreed scope may be treated as additional work and may be chargeable separately. Additional work should be confirmed in writing before execution where practicable.',
      'Vijaya Siri will endeavour to follow the approved scope. However, unforeseen site conditions or regulatory requirements may necessitate changes, which will be communicated to the customer.',
    ],
  },
  {
    id: 'design-specifications',
    title: 'Design & Specifications',
    paragraphs: [
      'Design selections, drawings, material specifications, finishes and other project details should be confirmed and approved through the applicable project process.',
      'Samples, catalogues, colour swatches and visual references are intended as general guides. Actual products and finishes may vary from samples or digital representations.',
      'Customer approval of designs and specifications is an important step before execution begins or proceeds to the next stage.',
    ],
  },
  {
    id: 'site-conditions',
    title: 'Site Conditions',
    paragraphs: [
      'Every project is affected by the specific conditions at the project site. Website information cannot account for every site-specific condition.',
      'Final construction requirements, methodology and costs are determined after appropriate site assessment, measurements, drawings, specifications and project review.',
      'Existing structures, plumbing, electrical systems, drainage, soil conditions, access restrictions and other site factors may affect project scope, cost and timeline.',
    ],
  },
  {
    id: 'materials-brands',
    title: 'Materials & Brands',
    paragraphs: [
      'Specified brands, products, materials, colours, finishes and specifications are subject to availability at the time of procurement.',
      'Where a specified product is unavailable, an equivalent alternative may be proposed. Material substitutions affecting cost, appearance or specification will be communicated to the customer for approval where practicable.',
      'Material warranties are provided by the respective manufacturers or suppliers and are subject to their terms.',
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    paragraphs: [
      'Payment milestones and schedules are defined in the applicable project quotation, work order or agreement.',
      'Payments should be made in accordance with the agreed project schedule. Late or delayed payments may affect project timelines, material procurement or the scheduling of work.',
      'Pricing, payment milestones and project-specific commercial terms are governed by the applicable quotation and Pricing Policies.',
    ],
  },
  {
    id: 'changes-additional-work',
    title: 'Changes & Additional Work',
    paragraphs: [
      'Changes to the agreed scope, design, materials or specifications after work has commenced may affect cost, timeline and project execution.',
      'Customers should communicate changes or additional requirements through the applicable project process. Changes will be assessed and, where necessary, a revised quotation or variation will be provided.',
      'Additional work outside the original scope is typically chargeable separately and should be confirmed before execution.',
    ],
  },
  {
    id: 'project-timelines',
    title: 'Project Timelines',
    paragraphs: [
      'Project timelines displayed or communicated are estimates based on the agreed scope and prevailing circumstances at the time of the estimate.',
      'Actual timelines may be affected by customer decisions, design approvals, statutory approvals, material availability, site conditions, weather, access restrictions or circumstances beyond reasonable control.',
      'Vijaya Siri will communicate anticipated delays where practicable and will work to minimise disruption to the project schedule.',
    ],
  },
  {
    id: 'customer-responsibilities',
    title: 'Customer Responsibilities',
    paragraphs: [
      'Customers are expected to provide accurate and complete information relevant to the project, including property details, requirements, preferences and any known site conditions.',
      'Reasonable site access should be provided to allow work to proceed in accordance with the agreed schedule.',
      'Timely decisions regarding design selections, materials, approvals and other project matters help maintain the project schedule.',
    ],
  },
  {
    id: 'approvals-statutory',
    title: 'Approvals & Statutory Requirements',
    paragraphs: [
      'Statutory approvals, permissions, licences and regulatory requirements relevant to a construction project should be clearly identified and allocated as part of the project scope.',
      'The responsibility for obtaining specific approvals will be defined in the applicable project quotation, work order or agreement.',
      'Delays caused by statutory approval processes, government authority requirements or regulatory changes may affect project timelines.',
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty',
    paragraphs: [
      'Warranty coverage, where applicable, is defined in the applicable project documentation, work order or warranty terms specific to the project.',
      'Warranty generally covers workmanship and materials as specified in the relevant project or warranty documentation. It does not cover damage caused by misuse, neglect, unauthorised modifications, normal wear and tear, external events or failure to follow applicable care guidelines.',
      'Warranty claims should be raised through the applicable project process. Vijaya Siri will assess each claim in accordance with the applicable warranty terms.',
    ],
  },
  {
    id: 'third-party-products',
    title: 'Third-Party Products & Services',
    paragraphs: [
      'Projects may include products, materials or services supplied or provided by third-party manufacturers, suppliers or service providers.',
      'Third-party products and services may carry their own manufacturer or vendor warranty, terms or conditions. Vijaya Siri is not responsible for the independent terms, performance or support provided by third-party suppliers.',
      'Where a third-party product or service is included in a project, the applicable manufacturer or vendor terms will govern that product or service.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Website & Intellectual Property',
    paragraphs: [
      'All content on this website, including text, graphics, logos, images, photographs, design elements, layouts, branding and software, is the property of Vijaya Siri or its content providers and is protected by applicable intellectual property laws.',
      'No content from this website may be copied, reproduced, republished, uploaded, posted, transmitted or distributed in any form without prior written consent from Vijaya Siri.',
      'Limited use of website content for personal, non-commercial purposes related to evaluating Vijaya Siri services is permitted, provided all proprietary notices are retained.',
    ],
  },
  {
    id: 'project-photographs',
    title: 'Project Photographs & Content',
    paragraphs: [
      'Project photographs, illustrations, specifications and examples on this website are intended to demonstrate the nature and quality of our work.',
      'Actual results may vary depending on design, materials, site conditions and customer requirements.',
      'Use of project photographs or content from this website for any purpose other than evaluating Vijaya Siri services requires prior written consent.',
    ],
  },
  {
    id: 'electronic-communications',
    title: 'Electronic Communications',
    paragraphs: [
      'Vijaya Siri may communicate with customers through email, phone, SMS, messaging applications, website notifications or other electronic means in connection with enquiries, quotations, project updates, service communications and related matters.',
      'Customers may receive service-related communications as part of the normal course of project coordination and customer support.',
    ],
  },
  {
    id: 'cancellation-refunds',
    title: 'Cancellation & Refunds',
    paragraphs: [
      'Cancellation and refund terms are governed by the applicable quotation, work order, payment schedule or agreement specific to the project.',
      'General website content or package information should not be relied upon as cancellation or refund terms. Customers should refer to the applicable project documentation for specific cancellation and refund provisions.',
      'Where applicable, cancellation terms, refund eligibility and any applicable deductions will be determined in accordance with the applicable project agreement.',
    ],
  },
  {
    id: 'force-majeure',
    title: 'Force Majeure',
    paragraphs: [
      'Vijaya Siri shall not be considered in breach of its obligations where performance is delayed, interrupted or prevented by circumstances beyond reasonable control.',
      'Force majeure events may include, but are not limited to, natural disasters, extreme weather, epidemics, government actions, regulatory changes, war, civil unrest, labour disputes, material shortages, infrastructure failures or other events beyond reasonable control.',
      'Affected obligations will be suspended for the duration of the force majeure event, and timelines will be adjusted accordingly.',
    ],
  },
  {
    id: 'limitation-liability',
    title: 'Limitation of Liability',
    paragraphs: [
      'To the maximum extent permitted by applicable law, Vijaya Siri shall not be liable for any indirect, incidental, special, consequential or punitive damages arising out of or related to the use of this website or reliance on website information.',
      "Vijaya Siri's total liability in connection with any project shall be subject to the terms of the applicable project agreement and applicable Indian law.",
      'These limitations do not affect rights that cannot be excluded or limited under applicable law.',
    ],
  },
  {
    id: 'changes-to-services',
    title: 'Changes to Services',
    paragraphs: [
      'Vijaya Siri reserves the right to modify, update or discontinue website content, service offerings, package information or related features at any time without prior notice.',
      'Changes to services will not retrospectively affect confirmed project agreements unless both parties agree to the changes.',
    ],
  },
  {
    id: 'changes-to-terms',
    title: 'Changes to These Terms',
    paragraphs: [
      'Vijaya Siri may update these Terms from time to time to reflect changes in services, technology, business practices or applicable legal requirements.',
      'The latest version will be published on this page with its updated date. Continued use of this website after changes are published constitutes acceptance of the updated Terms.',
      'Where applicable, material changes affecting active project agreements will be communicated through the applicable project process.',
      'Last updated: ' + LAST_UPDATED,
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law & Jurisdiction',
    paragraphs: [
      'These Terms shall be governed by and construed in accordance with the laws of India.',
      'Any dispute arising out of or relating to these Terms or the use of this website shall be subject to the exclusive jurisdiction of the competent courts in Karnataka, India, unless otherwise specified in the applicable project agreement.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: [
      'If you have questions or concerns about these Terms or any aspect of Vijaya Siri\'s services, please contact us through the official contact details provided on our website.',
      'Phone: ' + PHONE,
      'Email: ' + EMAIL,
    ],
  },
];

export default function TermsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.terms-section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('terms-section--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="terms-page">
      {/* ======================== HERO ======================== */}
      <section className="terms-hero">
        <div className="section-container">
          <div className="terms-hero-inner">
            <span className="terms-eyebrow">Terms &amp; Conditions</span>
            <h1 className="terms-hero-heading">
              Clear terms for a clear process.
            </h1>
            <p className="terms-hero-description">
              A straightforward overview of how Vijaya Siri's website,
              quotations and construction services work.
            </p>
          </div>
        </div>
      </section>

      {/* ======================== SECTIONS ======================== */}
      <div className="terms-sections" ref={containerRef}>
        <div className="section-container">

          {termsSections.map((section, index) => (
            <div key={section.id}>
              <section className={`terms-section${index === termsSections.length - 1 ? ' terms-section--last' : ''}`}>
                <div className="terms-section-header">
                  <span className="terms-section-number">{pad(index + 1)}</span>
                  <h2 className="terms-section-title">{section.title}</h2>
                </div>
                <div className="terms-section-body">
                  {section.paragraphs.map((p, pIndex) => (
                    <p key={pIndex}>{p}</p>
                  ))}
                </div>
              </section>
              {index < termsSections.length - 1 && <div className="terms-divider" />}
            </div>
          ))}

        </div>
      </div>

      {/* ======================== LEGAL DISCLAIMER ======================== */}
      <section className="terms-legal-disclaimer">
        <div className="section-container">
          <p className="terms-legal-disclaimer-text">
            These Terms &amp; Conditions are provided as a general website
            policy draft and should be reviewed by a qualified legal
            professional before being treated as the definitive legal terms
            of the business.
          </p>
        </div>
      </section>
    </div>
  );
}

import { Communication } from '../types';

export const mockCommunications: Communication[] = [
  {
    id: 'comm-01',
    senderName: 'Sarah Jenkins',
    senderEmail: 'sarah.jenkins@deliveryhero.com',
    companyName: 'Delivery Hero',
    folder: 'Recruiters',
    subject: 'Next Steps: Technical Pairing Session for Senior Cloud Infrastructure Engineer',
    linkedJobId: 'job-dh-01',
    linkedJobTitle: 'Senior Cloud Infrastructure Engineer',
    linkedApplicationId: 'app-dh-01',
    date: '2026-09-29T14:15:00+02:00',
    detectedType: 'Interview Invitation',
    actionRequired: true,
    actionSummary: 'Confirm technical pairing interview availability',
    body: `Hi Sriram,

Thank you for your time on the phone earlier today. The team was very impressed by your concrete examples of AWS EKS cluster management and GitOps automation.

We would like to invite you to our next round: a 60-minute technical pairing session with one of our Lead Platform Engineers. We will walk through real-world Kubernetes troubleshooting scenarios and discuss infrastructure resilience.

Please let me know if any of the following slots work for you (CET timezone):
- Tuesday, Oct 6 at 10:00 AM CET
- Wednesday, Oct 7 at 2:00 PM CET
- Thursday, Oct 8 at 11:00 AM CET

Looking forward to your reply!

Best regards,
Sarah Jenkins
Senior Tech Talent Partner | Delivery Hero Berlin`,
    suggestedResponse: `Hi Sarah,

Thank you for the update! I am excited to proceed to the technical pairing round.

Wednesday, Oct 7 at 2:00 PM CET works perfectly for me. Looking forward to discussing Kubernetes architecture with the platform lead.

Best regards,
Sriram Sugavanam`,
    isRead: false,
  },
  {
    id: 'comm-02',
    senderName: 'Marcus Lindner',
    senderEmail: 'marcus.lindner@n26.com',
    companyName: 'N26',
    folder: 'Referrals',
    subject: 'Referral submitted for Senior SRE position at N26 Berlin',
    linkedJobId: 'job-n26-01',
    linkedJobTitle: 'Senior SRE / Site Reliability Engineer',
    linkedApplicationId: 'app-n26-01',
    date: '2026-09-25T11:20:00+02:00',
    detectedType: 'Referral Update',
    actionRequired: false,
    body: `Hey Sriram,

Just wanted to let you know that I submitted your referral through our internal Workday portal for the Senior SRE role in Berlin.

I attached your tailored CV highlighting HashiCorp Vault and error-budget models. Our engineering recruiter Svenja should reach out directly within 2 business days.

Let me know if you need any prep tips regarding our system architecture format!

Best,
Marcus`,
    isRead: true,
  },
  {
    id: 'comm-03',
    senderName: 'Elena Rostova',
    senderEmail: 'elena.rostova@personio.com',
    companyName: 'Personio',
    folder: 'Recruiters',
    subject: 'Personio Application: Lead DevOps / Cloud Platform Engineer (Munich)',
    linkedJobId: 'job-personio-01',
    linkedJobTitle: 'Lead DevOps / Cloud Platform Engineer',
    linkedApplicationId: 'app-personio-01',
    date: '2026-09-28T09:40:00+02:00',
    detectedType: 'Application Acknowledgment',
    actionRequired: false,
    body: `Dear Sriram,

Thank you for your application for the Lead DevOps / Cloud Platform Engineer role in Munich.

We have received your application materials and our engineering hiring team is currently evaluating your profile against our open platform roadmap. We aim to get back to you with next steps within 5 working days.

Best regards,
Elena Rostova
Talent Acquisition Team | Personio`,
    isRead: true,
  },
  {
    id: 'comm-04',
    senderName: 'Zalando Careers Automation',
    senderEmail: 'jobs@zalando.de',
    companyName: 'Zalando SE',
    folder: 'Applications',
    subject: 'We have received your profile for Lead Platform Engineer (Req #482910)',
    linkedJobId: 'job-zalando-01',
    linkedJobTitle: 'Lead Platform Engineer',
    linkedApplicationId: 'app-zalando-01',
    date: '2026-09-30T16:05:00+02:00',
    detectedType: 'Application Acknowledgment',
    actionRequired: false,
    body: `Dear Sriram,

Thank you for submitting your application for the Lead Platform Engineer position at Zalando SE in Berlin.

Our Talent Acquisition team, together with our Platform Engineering Leadership, will carefully review your qualifications. Due to high interest, we ask for your patience while we review. You can track your application status at any time in your candidate dashboard.

Sincerely,
Zalando People Team`,
    isRead: false,
  },
  {
    id: 'comm-05',
    senderName: 'Carla Schmidt',
    senderEmail: 'carla.schmidt@traderepublic.com',
    companyName: 'Trade Republic',
    folder: 'Recruiters',
    subject: 'Work Authorization & Relocation Clarification — Trade Republic',
    linkedJobId: 'job-traderepublic-01',
    linkedJobTitle: 'Senior Infrastructure & DevOps Engineer',
    linkedApplicationId: 'app-traderepublic-01',
    date: '2026-09-26T15:30:00+02:00',
    detectedType: 'HR Follow-up',
    actionRequired: true,
    actionSummary: 'Confirm Blue Card eligibility details',
    body: `Hi Sriram,

Thank you for your interest in our Senior Infrastructure role. We noticed that you are currently based in India and planning relocation to Berlin.

Could you please confirm if you hold a recognized STEM degree that qualifies for the German EU Blue Card fast-track visa? We support full visa processing for qualified engineering leads.

Best regards,
Carla Schmidt
People & Culture | Trade Republic`,
    suggestedResponse: `Hi Carla,

Thank you for following up! Yes, I hold a formal Bachelor of Engineering degree in Computer Science, which is fully recognized by the German Anabin database (H+ status). With my 8 years of specialized cloud and Kubernetes engineering experience and the offered salary band (€95K+), I qualify directly for the EU Blue Card.

Best regards,
Sriram Sugavanam`,
    isRead: false,
  },
  {
    id: 'comm-06',
    senderName: 'Vikram Mehta',
    senderEmail: 'vikram.mehta@hellofresh.com',
    companyName: 'HelloFresh',
    folder: 'Referrals',
    subject: 'Catching up on HelloFresh Lead Cloud Architect role',
    linkedJobId: 'job-hellofresh-01',
    linkedJobTitle: 'Lead Cloud Infrastructure Architect',
    linkedApplicationId: 'app-hellofresh-01',
    date: '2026-09-24T18:10:00+02:00',
    detectedType: 'Referral Update',
    actionRequired: true,
    actionSummary: 'Reply to Vikram with preferred catch-up time',
    body: `Hey Sriram,

Saw your message about the Lead Cloud Architect opening in Berlin. The infrastructure group here is undergoing a major multi-region redesign on AWS, which fits your background right down to the ground.

Let’s hop on a quick 15-minute Google Meet this Friday or Saturday so I can share more details on the team dynamic before I put in the referral link.

Cheers,
Vikram`,
    suggestedResponse: `Hey Vikram,

That sounds fantastic! Friday around 4:00 PM CET or anytime Saturday morning works great for me. Send over the invite when you have a moment.

Thanks,
Sriram`,
    isRead: false,
  },
  {
    id: 'comm-07',
    senderName: 'Celonis Talent Operations',
    senderEmail: 'recruiting@celonis.com',
    companyName: 'Celonis',
    folder: 'Applications',
    subject: 'Application Update: Senior Kubernetes / Cloud Platform Engineer (Munich)',
    linkedJobId: 'job-celonis-01',
    linkedJobTitle: 'Senior Kubernetes / Cloud Platform Engineer',
    linkedApplicationId: 'app-celonis-01',
    date: '2026-09-23T10:15:00+02:00',
    detectedType: 'HR Follow-up',
    actionRequired: false,
    body: `Hello Sriram,

We wanted to let you know that your internal referral submitted by Johannes Weber has been assigned to our senior technical recruiter. We will be in touch shortly regarding next steps.

Best regards,
Celonis Talent Team`,
    isRead: true,
  },
  {
    id: 'comm-08',
    senderName: 'Flix Careers Team',
    senderEmail: 'jobs@flixbus.com',
    companyName: 'Flix',
    folder: 'HR',
    subject: 'Thank you for your interest in Flix Tech',
    linkedJobId: 'job-flix-01',
    linkedJobTitle: 'Senior DevOps / SRE Engineer',
    date: '2026-09-28T17:00:00+02:00',
    detectedType: 'Application Acknowledgment',
    actionRequired: false,
    body: `Dear Applicant,

We have received your profile for the Senior DevOps / SRE Engineer position at Flix in Munich. Our engineering hiring team reviews all incoming profiles.

Best,
Flix People Team`,
    isRead: true,
  },
  {
    id: 'comm-09',
    senderName: 'N26 Recruiting',
    senderEmail: 'recruiting@n26.com',
    companyName: 'N26',
    folder: 'Interviews',
    subject: 'Invitation to System Architecture Interview — N26 Berlin',
    linkedJobId: 'job-n26-01',
    linkedJobTitle: 'Senior SRE / Site Reliability Engineer',
    linkedApplicationId: 'app-n26-01',
    date: '2026-09-27T16:45:00+02:00',
    detectedType: 'Interview Invitation',
    actionRequired: true,
    actionSummary: 'Calendar invite confirmed for Oct 3 at 14:00 CET',
    body: `Dear Sriram,

We are delighted to invite you to the System Architecture and Incident Response round for the Senior SRE role at N26.

Your interviewers will be Marcus Lindner (Staff SRE) and Svenja Richter (Engineering Manager). A calendar invitation with Google Meet details has been sent for Friday, October 3, 2026 at 14:00 CET.

Best regards,
N26 Talent Acquisition`,
    isRead: false,
  },
  {
    id: 'comm-10',
    senderName: 'Siemens Healthineers HR',
    senderEmail: 'careers.it@siemens-healthineers.com',
    companyName: 'Siemens Healthineers',
    folder: 'HR',
    subject: 'Inquiry response regarding international relocation to Frankfurt',
    linkedJobId: 'job-siemens-01',
    linkedJobTitle: 'Senior DevOps & Cloud Security Engineer',
    date: '2026-09-26T11:00:00+02:00',
    detectedType: 'HR Follow-up',
    actionRequired: false,
    body: `Dear Sriram,

Regarding your query about work authorization for the Frankfurt DevOps role: While we prefer candidates who already hold an unrestricted German residence permit, senior specialists who independently qualify for the EU Blue Card are considered on a case-by-case basis.

Best regards,
Siemens Healthineers Recruitment`,
    isRead: true,
  },
];

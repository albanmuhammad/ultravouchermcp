export type SfAssociatedContactDetails = Readonly<{
  firstName: string;
  lastName: string;
  email: string;
  allowDuplicateRecords?: boolean;
  additionalContactFieldValues?: {
    attributes: Record<string, string>;
  };
}>;

export type SfIndividualMemberEnrollment = Readonly<{
  enrollmentDate: string; // ISO string
  membershipNumber: string;
  memberStatus: "Active" | "Inactive" | "Custom";
  enrollmentChannel?:
    | "Pos"
    | "Web"
    | "Email"
    | "CallCenter"
    | "Social"
    | "Mobile"
    | "Store"
    | "Franchise"
    | "Partner"
    | "Print";
  associatedContactDetails: SfAssociatedContactDetails;
  canReceivePromotions?: boolean;
  canReceivePartnerPromotions?: boolean;
  createTransactionJournals?: boolean;
  transactionJournalStatementFrequency?: "Monthly" | "Quarterly";
  transactionJournalStatementMethod?: "Mail" | "Email";
  membershipEndDate?: string;
  referredBy?: string;
  referredByMemberReferralCode?: string;
  relatedCorporateMembershipNumber?: string;
  additionalMemberFieldValues?: {
    attributes: Record<string, string>;
  };
}>;

export type SfEnrollmentResponse = Readonly<{
  loyaltyProgramMemberId: string;
  personAccountId: string;
}>;

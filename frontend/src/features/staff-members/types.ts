export type StaffMember = {
	id: string;
	full_name: string;
	phone: string | null;
	is_active: boolean;
	// null = no link (never created or disabled)
	link_created_at: string | null;
	created_at: string;
	updated_at: string;
};

export type StaffMemberInput = {
	full_name: string;
	phone: string | null;
	is_active?: boolean;
};

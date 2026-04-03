export interface Person {
	id: number;
	name: string;
	username: string;
	created: string;
	lastLogin: string;
	totalTexts: number;
}

export interface Conference {
	id: number;
	name: string;
	creator: number;
	created: string;
	type: 'open' | 'closed' | 'secret';
	description: string;
	members: number;
	totalTexts: number;
}

export interface TextInfo {
	id: number;
	author: number;
	created: string;
	subject: string;
	body: string;
	recipients: number[];
	ccRecipients?: number[];
	commentTo?: number[];
	commentedIn?: number[];
	lines: number;
	contentType: 'text/plain' | 'text/enriched';
}

export interface Membership {
	userId: number;
	conferenceId: number;
	priority: number;
	unread: number;
	lastRead: number;
	added: string;
}

export interface Session {
	sessionId: number;
	userId: number;
	loginTime: string;
	idleSeconds: number;
	currentConference: number;
	doing: string;
	clientName: string;
}

export interface PersonalMessage {
	from: number;
	to: number;
	timestamp: string;
	body: string;
}

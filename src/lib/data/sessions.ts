import type { Session } from '$lib/types';

export const sessions: Session[] = [
	{
		sessionId: 501,
		userId: 1,
		loginTime: '2026-04-03T09:15:00',
		idleSeconds: 30,
		currentConference: 2,
		doing: 'Läser text 110',
		clientName: 'jskom2'
	},
	{
		sessionId: 502,
		userId: 2,
		loginTime: '2026-04-03T08:42:00',
		idleSeconds: 0,
		currentConference: 3,
		doing: 'Skriver en text',
		clientName: 'lyskom.el 0.48.1'
	},
	{
		sessionId: 503,
		userId: 4,
		loginTime: '2026-04-03T07:30:00',
		idleSeconds: 600,
		currentConference: 2,
		doing: 'Väntar',
		clientName: 'TkKOM 0.3'
	},
	{
		sessionId: 504,
		userId: 8,
		loginTime: '2026-04-03T10:30:00',
		idleSeconds: 0,
		currentConference: 3,
		doing: 'Läser text 112',
		clientName: 'jskom2'
	}
];

import type { Membership } from '$lib/types';

export const memberships: Membership[] = [
	// Johan (user 8) - the logged-in user
	{ userId: 8, conferenceId: 1, priority: 100, unread: 3, lastRead: 104, added: '2017-09-01' },
	{ userId: 8, conferenceId: 2, priority: 200, unread: 5, lastRead: 100, added: '2017-09-01' },
	{ userId: 8, conferenceId: 3, priority: 255, unread: 2, lastRead: 112, added: '2017-09-15' },
	{ userId: 8, conferenceId: 4, priority: 50, unread: 1, lastRead: 115, added: '2018-01-10' },
	{ userId: 8, conferenceId: 5, priority: 150, unread: 0, lastRead: 118, added: '2019-03-01' },

	// Anna (user 1)
	{ userId: 1, conferenceId: 1, priority: 100, unread: 0, lastRead: 119, added: '2018-03-12' },
	{ userId: 1, conferenceId: 2, priority: 200, unread: 1, lastRead: 108, added: '2018-03-12' },
	{ userId: 1, conferenceId: 3, priority: 150, unread: 0, lastRead: 114, added: '2018-04-01' },
	{ userId: 1, conferenceId: 4, priority: 80, unread: 2, lastRead: 115, added: '2018-05-20' },

	// Erik (user 2)
	{ userId: 2, conferenceId: 1, priority: 100, unread: 1, lastRead: 107, added: '2015-11-01' },
	{ userId: 2, conferenceId: 2, priority: 150, unread: 0, lastRead: 120, added: '2015-11-01' },
	{ userId: 2, conferenceId: 3, priority: 200, unread: 1, lastRead: 113, added: '2015-11-01' },
	{ userId: 2, conferenceId: 5, priority: 255, unread: 0, lastRead: 118, added: '2015-11-01' },

	// Lars (user 4)
	{ userId: 4, conferenceId: 1, priority: 50, unread: 2, lastRead: 101, added: '2005-01-20' },
	{ userId: 4, conferenceId: 2, priority: 200, unread: 3, lastRead: 106, added: '2005-01-20' },
	{ userId: 4, conferenceId: 3, priority: 255, unread: 0, lastRead: 114, added: '2005-01-20' },

	// Karin (user 5) - new member
	{ userId: 5, conferenceId: 1, priority: 100, unread: 1, lastRead: 107, added: '2026-03-20' },

	// Maria (user 3)
	{ userId: 3, conferenceId: 1, priority: 100, unread: 0, lastRead: 119, added: '2020-06-15' },
	{ userId: 3, conferenceId: 4, priority: 150, unread: 0, lastRead: 117, added: '2020-06-15' },

	// Sofia (user 7)
	{ userId: 7, conferenceId: 2, priority: 100, unread: 0, lastRead: 120, added: '2021-02-14' },
	{ userId: 7, conferenceId: 4, priority: 150, unread: 0, lastRead: 117, added: '2021-03-01' },

	// Olof (user 6) - lurker
	{ userId: 6, conferenceId: 1, priority: 50, unread: 5, lastRead: 101, added: '2019-08-05' },
	{ userId: 6, conferenceId: 4, priority: 100, unread: 0, lastRead: 117, added: '2019-08-05' }
];

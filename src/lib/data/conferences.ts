import type { Conference } from '$lib/types';

export const conferences: Conference[] = [
	{
		id: 1,
		name: 'Allmänt',
		creator: 2,
		created: '2005-01-01',
		type: 'open',
		description: 'Allmän diskussion om allt möjligt. Alla är välkomna!',
		members: 8,
		totalTexts: 4521
	},
	{
		id: 2,
		name: 'Programmering',
		creator: 4,
		created: '2005-03-15',
		type: 'open',
		description: 'Diskussion om programmering, verktyg och teknik.',
		members: 6,
		totalTexts: 8932
	},
	{
		id: 3,
		name: 'LysKOM-utveckling',
		creator: 4,
		created: '2005-01-10',
		type: 'open',
		description: 'Utveckling av LysKOM-servern, protokollet och klienter.',
		members: 5,
		totalTexts: 3210
	},
	{
		id: 4,
		name: 'Musik och Film',
		creator: 3,
		created: '2010-07-20',
		type: 'open',
		description: 'Rekommendationer och diskussioner om musik, film och kultur.',
		members: 7,
		totalTexts: 2105
	},
	{
		id: 5,
		name: 'Systemadministration',
		creator: 2,
		created: '2006-02-01',
		type: 'closed',
		description: 'Intern diskussion om serverunderhåll och drift. Bara för sysadmins.',
		members: 3,
		totalTexts: 987
	}
];

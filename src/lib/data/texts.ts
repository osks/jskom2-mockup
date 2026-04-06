import type { TextInfo } from '$lib/types';

export const texts: TextInfo[] = [
	// Thread A: "Rust eller Go?" in Programmering (conf 2)
	{
		id: 100,
		author: 4,
		created: '2026-04-02T14:20:00',
		subject: 'Rust eller Go?',
		body: `Jag har funderat ett tag på att lära mig ett nytt systemspråk.\nRust verkar ha bra säkerhetsgarantier men är svårare att lära sig.\nGo är enklare men saknar en del features.\n\nVad tycker ni? Har någon erfarenhet av båda?`,
		recipients: [2],
		ccRecipients: [3],
		commentTo: [],
		commentedIn: [103, 105],
		marks: [
			{ userId: 1, type: 'important' },
			{ userId: 7, type: 'bookmark' }
		],
		remarks: [
			{ author: 1, created: '2026-04-02T15:00:00', body: 'Bra fråga!' },
			{ author: 7, created: '2026-04-02T17:50:00', body: '👍' }
		],
		lines: 5,
		contentType: 'text/plain'
	},
	{
		id: 103,
		author: 1,
		created: '2026-04-02T15:05:00',
		subject: 'Re: Rust eller Go?',
		body: `Rust, definitivt. Borrow checker är jobbig i början men man\nlär sig snabbt. Och sedan slipper man minnesläckor och\nrace conditions helt.\n\nJag har kört Rust i produktion i två år nu och det har\nvart fantastiskt stabilt.`,
		recipients: [2],
		commentTo: [100],
		commentedIn: [106, 108],
		lines: 6,
		contentType: 'text/plain'
	},
	{
		id: 105,
		author: 3,
		created: '2026-04-02T15:30:00',
		subject: 'Re: Rust eller Go?',
		body: `Jag kör mest Python själv, men om jag skulle välja mellan\nde två så skulle jag nog ta Go. Enklare att komma igång\noch perfekt för webbservrar och microservices.`,
		recipients: [2],
		commentTo: [100],
		commentedIn: [],
		lines: 3,
		contentType: 'text/plain'
	},
	{
		id: 106,
		author: 2,
		created: '2026-04-02T16:12:00',
		subject: 'Re: Rust eller Go?',
		body: `Jag håller inte med. Go är överlägset för backend-tjänster.\nEnkelheten är en feature, inte en brist. Goroutines gör\nconcurrency trivialt jämfört med Rusts async/await-modell.\n\nI praktiken behöver man sällan Rusts minnesgarantier\nom man inte skriver OS-kärnor eller liknande.`,
		recipients: [2],
		commentTo: [103],
		commentedIn: [110],
		lines: 6,
		contentType: 'text/plain'
	},
	{
		id: 108,
		author: 7,
		created: '2026-04-02T17:45:00',
		subject: 'Re: Rust eller Go?',
		body: `Intressant diskussion! Jag har skrivit en del i båda och\ntänkte dela med mig av mina erfarenheter.\n\nRust:\n+ Typsystemet fångar extremt många buggar vid kompilering\n+ Utmärkt prestanda, jämförbart med C/C++\n+ Cargo är det bästa byggsystemet jag använt\n- Lång inlärningskurva, speciellt lifetimes\n- Kompileringstider kan vara frustrerande\n\nGo:\n+ Extremt snabb kompilering\n+ Goroutines gör concurrent programmering enkelt\n+ Standardbiblioteket är fantastiskt\n- Saknar generics (uppdatering: finns nu sedan 1.18)\n- Felhantering med if err != nil överallt\n\nKort sagt: Rust för systemnivå, Go för tjänster och verktyg.`,
		recipients: [2],
		commentTo: [103],
		commentedIn: [],
		remarks: [
			{ author: 4, created: '2026-04-02T18:00:00', body: 'Bra sammanfattning!' },
			{ author: 1, created: '2026-04-02T18:10:00', body: 'Håller med om Cargo' }
		],
		lines: 17,
		contentType: 'text/plain'
	},
	{
		id: 110,
		author: 1,
		created: '2026-04-02T19:20:00',
		subject: 'Tokio och async i Rust',
		body: `Visst, goroutines är smidiga. Men Rusts typsystem ger dig\ngarantier vid kompilering som Go inte kan matcha. Det\nbetyder färre buggar i produktion.\n\nOch async/await i Rust funkar bra med tokio numera.\nJag har bytt helt till tokio för alla mina nätverkstjänster.`,
		recipients: [2],
		commentTo: [106],
		commentedIn: [],
		lines: 6,
		contentType: 'text/plain'
	},

	// Thread B: "Välkommen Karin!" in Allmänt (conf 1)
	{
		id: 101,
		author: 2,
		created: '2026-03-21T09:00:00',
		subject: 'Välkommen Karin!',
		body: `Hej alla!\n\nVi har fått en ny medlem: Karin Berg. Hon hittade LysKOM\nvia en länk på Lysator och ville prova.\n\nVälkommen ska du vara, Karin!`,
		recipients: [1],
		commentTo: [],
		commentedIn: [104, 107, 109],
		lines: 6,
		contentType: 'text/plain'
	},
	{
		id: 104,
		author: 1,
		created: '2026-03-21T09:30:00',
		subject: 'Re: Välkommen Karin!',
		body: `Välkommen! Tveka inte att fråga om du undrar något\nom hur LysKOM fungerar. Vi hjälper gärna till!`,
		recipients: [1],
		commentTo: [101],
		commentedIn: [],
		lines: 2,
		contentType: 'text/plain'
	},
	{
		id: 107,
		author: 5,
		created: '2026-03-21T10:15:00',
		subject: 'Re: Välkommen Karin!',
		body: `Tack allesammans! Jag har letat efter ett alternativ till\nvanliga sociala medier och det här verkar perfekt.\n\nSå spännande med ett system som funnits sedan 80-talet!`,
		recipients: [1],
		commentTo: [101],
		commentedIn: [],
		lines: 4,
		contentType: 'text/plain'
	},
	{
		id: 109,
		author: 4,
		created: '2026-03-21T11:00:00',
		subject: 'Re: Välkommen Karin!',
		body: `Välkommen! Roligt med nya medlemmar.\n\nTips: prova kommandot "lista möten" för att se alla\ntillgängliga konferenser. Det finns mycket att upptäcka!`,
		recipients: [1],
		commentTo: [101],
		commentedIn: [],
		lines: 4,
		contentType: 'text/plain'
	},

	// Thread C: "Webbklient för LysKOM" in LysKOM-utveckling (conf 3)
	{
		id: 102,
		author: 8,
		created: '2026-04-01T10:00:00',
		subject: 'Webbklient för LysKOM',
		body: `Jag har börjat fundera på att bygga en modern webbklient\nför LysKOM. Elisp-klienten är fantastisk men inte alla\nanvänder Emacs.\n\njskom finns redan men jag tänker att det kanske är dags\nför en ny version med modernare teknik.\n\nTankar? Vad borde prioriteras i en ny webbklient?`,
		recipients: [3],
		ccRecipients: [1],
		commentTo: [],
		commentedIn: [111, 112, 113],
		marks: [
			{ userId: 1, type: 'bookmark' }
		],
		remarks: [
			{ author: 4, created: '2026-04-01T10:30:00', body: 'Spännande projekt!' }
		],
		lines: 8,
		contentType: 'text/plain'
	},
	{
		id: 111,
		author: 4,
		created: '2026-04-01T11:30:00',
		subject: 'Re: Webbklient för LysKOM',
		body: `Hmm, jag är lite skeptisk. Elisp-klienten fungerar utmärkt\noch har alla features man behöver. Varför uppfinna hjulet\npå nytt?\n\nMen om du ändå vill göra det: se till att den hanterar\nläsordningen korrekt. Det är det som gör LysKOM unikt.`,
		recipients: [3],
		commentTo: [102],
		commentedIn: [],
		lines: 6,
		contentType: 'text/plain'
	},
	{
		id: 112,
		author: 1,
		created: '2026-04-01T12:15:00',
		subject: 'Re: Webbklient för LysKOM',
		body: `Bra idé! En webbklient skulle sänka tröskeln enormt.\nJag har flera vänner som vill prova LysKOM men inte\nvill installera Emacs.\n\nFörslag på features att prioritera:\n- Läsordning (som Lars sa)\n- Trådvy (detta saknar elisp-klienten!)\n- Mobilanpassning\n- Personliga meddelanden`,
		recipients: [3],
		commentTo: [102],
		commentedIn: [114],
		lines: 9,
		contentType: 'text/plain'
	},
	{
		id: 113,
		author: 2,
		created: '2026-04-01T13:00:00',
		subject: 'Re: Webbklient för LysKOM',
		body: `Intressant projekt! Från serversidan kan jag säga att\nProtokoll A har bra stöd för det mesta du behöver.\n\njskom kör via en Python-proxy som översätter HTTP till\nProtokoll A. Det fungerar bra som arkitektur.\n\nJag kan hjälpa till med serverkonfiguration om du behöver.`,
		recipients: [3],
		commentTo: [102],
		commentedIn: [],
		lines: 7,
		contentType: 'text/plain'
	},
	{
		id: 114,
		author: 8,
		created: '2026-04-01T14:30:00',
		subject: 'Re: Webbklient för LysKOM',
		body: `Tack för feedbacken! Jag tänker börja med en mockup för\natt utforska interaktionsmönster.\n\nAnna: bra lista! Trådvy är definitivt något en webbklient\nkan göra bättre än en textbaserad klient.\n\nSvelteKit + Tailwind är min plan för teknikstacken.`,
		recipients: [3],
		commentTo: [112],
		commentedIn: [],
		lines: 7,
		contentType: 'text/plain'
	},

	// Thread D: "Bästa albumet 2025?" in Musik och Film (conf 4)
	{
		id: 115,
		author: 3,
		created: '2026-04-02T20:00:00',
		subject: 'Bästa albumet 2025?',
		body: `Nu när vi är en bit in i 2026 - vad var ert bästa album\nfrån förra året?\n\nJag fastnade för Meshuggahs senaste. Otroligt tight.`,
		recipients: [4],
		commentTo: [],
		commentedIn: [116, 117],
		lines: 4,
		contentType: 'text/plain'
	},
	{
		id: 116,
		author: 6,
		created: '2026-04-02T21:30:00',
		subject: 'Re: Bästa albumet 2025?',
		body: `Jag lyssnade mest på det nya från Opeth. Progressiv rock\nnär den är som bäst.`,
		recipients: [4],
		commentTo: [115],
		commentedIn: [],
		lines: 2,
		contentType: 'text/plain'
	},
	{
		id: 117,
		author: 7,
		created: '2026-04-02T22:15:00',
		subject: 'Re: Bästa albumet 2025?',
		body: `Björks nya album var fantastiskt! Helt experimentellt\noch annorlunda, precis som man förväntar sig av henne.\n\nMen jag gillade också Grimes comeback-album.`,
		recipients: [4],
		commentTo: [115],
		commentedIn: [],
		lines: 4,
		contentType: 'text/plain'
	},

	// Standalone texts
	{
		id: 118,
		author: 2,
		created: '2026-04-03T06:00:00',
		subject: 'Planerat underhåll fredag kväll',
		body: `Hej,\n\nVi kommer att uppgradera servern på fredag mellan 22:00\noch 00:00. LysKOM kommer vara nere under denna tid.\n\nMvh\nErik`,
		recipients: [5],
		commentTo: [],
		commentedIn: [],
		lines: 7,
		contentType: 'text/plain'
	},
	{
		id: 119,
		author: 1,
		created: '2026-04-03T08:30:00',
		subject: 'Helgplaner?',
		body: `Någon som vill hänga på helgen? Jag tänkte ta en promenad\ni Trädgårdsföreningen om vädret tillåter.\n\nAlla är välkomna!`,
		recipients: [1],
		commentTo: [],
		commentedIn: [],
		lines: 4,
		contentType: 'text/plain'
	},
	{
		id: 120,
		author: 4,
		created: '2026-04-03T09:00:00',
		subject: 'Emacs-tips: magit',
		body: `För er som använder Emacs och git: kolla in magit om ni\ninte redan gjort det. Det är det bästa git-gränssnittet\njag någonsin använt.\n\nM-x package-install RET magit RET\n\nSedan C-x g för att öppna magit-status i ert repo.\nFullständigt magiskt.`,
		recipients: [2],
		commentTo: [],
		commentedIn: [],
		lines: 8,
		contentType: 'text/plain'
	}
];

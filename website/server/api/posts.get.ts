import { postsQuerySchema } from '../schemas/post';

export default defineEventHandler(async (event) => {
	const result = await getValidatedQuery(event, q => postsQuerySchema.safeParse(q));

	if (!result.success)
		throwValidationError(result);

	const { search, orderBy = 'createdAt', orderDir = 'desc' } = result.data;

	const posts = await prisma.post.findMany({
		where: search
			? {
					OR: [
						{ title: { contains: search, mode: 'insensitive' } },
						{ description: { contains: search, mode: 'insensitive' } },
						{ content: { contains: search, mode: 'insensitive' } },
					],
				}
			: undefined,
		orderBy: {
			[orderBy]: orderDir,
		},
		include: {
			thumbnail: {
				omit: {
					updatedAt: true,
					createdAt: true,
					authorId: true,
				},
			},
		},
		omit: { content: true },
	});

	// const testPosts: Post[] = [
	// 	{
	// 		id: 1,
	// 		authorId: 1,
	// 		title: 'Reversing Strinova Network Protocol',
	// 		description: 'My experience with reversing Strinova game network protocol.',
	// 		slug: 'reversing-strinova-network-protocol',
	// 		readTimeSec: 120,
	// 		views: 54,
	// 		createdAt: new Date('2025-03-10'),
	// 		updatedAt: new Date('2025-03-10'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 2,
	// 		authorId: 1,
	// 		title: 'Writing a Custom Packet Sniffer in Rust',
	// 		description: 'Building a lightweight packet sniffer from scratch using Rust and raw sockets.',
	// 		slug: 'custom-packet-sniffer-rust',
	// 		readTimeSec: 210,
	// 		views: 132,
	// 		createdAt: new Date('2025-02-18'),
	// 		updatedAt: new Date('2025-02-18'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 3,
	// 		authorId: 1,
	// 		title: 'Exploiting a Use-After-Free in a CTF Kernel Challenge',
	// 		description: 'A deep dive into a UAF kernel exploit I solved during a recent CTF competition.',
	// 		slug: 'uaf-kernel-ctf-exploit',
	// 		readTimeSec: 360,
	// 		views: 289,
	// 		createdAt: new Date('2025-01-30'),
	// 		updatedAt: new Date('2025-01-30'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 4,
	// 		authorId: 1,
	// 		title: 'Static Analysis of a Steam Game Anti-Cheat',
	// 		description: 'Poking at a usermode anti-cheat module with IDA Pro and figuring out its detection methods.',
	// 		slug: 'static-analysis-anticheat',
	// 		readTimeSec: 480,
	// 		views: 741,
	// 		createdAt: new Date('2024-12-05'),
	// 		updatedAt: new Date('2024-12-05'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 5,
	// 		authorId: 1,
	// 		title: 'Fuzzing a Closed-Source Binary with AFL++',
	// 		description: 'Using AFL++ with QEMU mode to fuzz a closed-source binary and finding a stack buffer overflow.',
	// 		slug: 'fuzzing-closed-source-afl',
	// 		readTimeSec: 300,
	// 		views: 198,
	// 		createdAt: new Date('2024-11-14'),
	// 		updatedAt: new Date('2024-11-14'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 6,
	// 		authorId: 1,
	// 		title: 'Analyzing a Golang Malware Sample',
	// 		description: 'Reversing a real-world Golang malware dropper: unpacking, deobfuscation, and C2 extraction.',
	// 		slug: 'golang-malware-analysis',
	// 		readTimeSec: 420,
	// 		views: 513,
	// 		createdAt: new Date('2024-10-22'),
	// 		updatedAt: new Date('2024-10-22'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 7,
	// 		authorId: 1,
	// 		title: 'How I Bypassed Rate Limiting on a Bug Bounty Target',
	// 		description: 'A walkthrough of identifying and exploiting a flawed rate-limit implementation in a web API.',
	// 		slug: 'bypassing-rate-limiting-bug-bounty',
	// 		readTimeSec: 180,
	// 		views: 376,
	// 		createdAt: new Date('2024-09-07'),
	// 		updatedAt: new Date('2024-09-07'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 8,
	// 		authorId: 1,
	// 		title: 'Memory Forensics with Volatility 3',
	// 		description: 'Using Volatility 3 to analyze a Windows memory dump and reconstruct attacker activity.',
	// 		slug: 'memory-forensics-volatility3',
	// 		readTimeSec: 270,
	// 		views: 162,
	// 		createdAt: new Date('2024-08-19'),
	// 		updatedAt: new Date('2024-08-19'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 9,
	// 		authorId: 1,
	// 		title: 'Deobfuscating a JavaScript Loader',
	// 		description: 'Step-by-step deobfuscation of a heavily packed JS loader used to deliver a banking trojan.',
	// 		slug: 'deobfuscating-javascript-loader',
	// 		readTimeSec: 240,
	// 		views: 88,
	// 		createdAt: new Date('2024-07-03'),
	// 		updatedAt: new Date('2024-07-03'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// 	{
	// 		id: 10,
	// 		authorId: 1,
	// 		title: 'Building a Kernel Driver for Process Hiding',
	// 		description: 'Writing a Windows kernel driver that unlinks processes from PsActiveProcessHead to hide them.',
	// 		slug: 'kernel-driver-process-hiding',
	// 		readTimeSec: 540,
	// 		views: 920,
	// 		createdAt: new Date('2024-06-11'),
	// 		updatedAt: new Date('2024-06-11'),
	// 		thumbnailUid: null,
	// 		thumbnail: null,
	// 	},
	// ];

	// return testPosts;

	return posts;
});

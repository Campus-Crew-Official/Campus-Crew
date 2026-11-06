import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Campus Crew database seeding with NITW Campus Clubs...');

  // Clean existing tables in reverse dependency order
  await prisma.notificationPreference.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.volunteerAssignment.deleteMany();
  await prisma.volunteerApplication.deleteMany();
  await prisma.volunteerOpportunity.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.recruitmentApplication.deleteMany();
  await prisma.recruitmentDrive.deleteMany();
  await prisma.clubMembership.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@campuscrew.edu',
      passwordHash: defaultPasswordHash,
      name: 'Dr. Eleanor Vance',
      rollNumber: 'ADM-001',
      department: 'Dean of Student Affairs',
      year: 4,
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const coordinator1 = await prisma.user.create({
    data: {
      email: 'coordinator@campuscrew.edu',
      passwordHash: defaultPasswordHash,
      name: 'Arjun Sharma',
      rollNumber: 'CS2023041',
      department: 'Computer Science & Engineering',
      year: 3,
      role: 'COORDINATOR',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const coordinator2 = await prisma.user.create({
    data: {
      email: 'sarah.art@campuscrew.edu',
      passwordHash: defaultPasswordHash,
      name: 'Sarah Jenkins',
      rollNumber: 'DS2023018',
      department: 'Design & Visual Arts',
      year: 3,
      role: 'COORDINATOR',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student@campuscrew.edu',
      passwordHash: defaultPasswordHash,
      name: 'Sneha Reddy',
      rollNumber: 'IT2024089',
      department: 'Information Technology',
      year: 2,
      role: 'STUDENT',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'rohit.k@campuscrew.edu',
      passwordHash: defaultPasswordHash,
      name: 'Rohit Kumar',
      rollNumber: 'CS2024102',
      department: 'Computer Science',
      year: 2,
      role: 'STUDENT',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'ananya.m@campuscrew.edu',
      passwordHash: defaultPasswordHash,
      name: 'Ananya Mishra',
      rollNumber: 'EC2024045',
      department: 'Electronics & Comm.',
      year: 2,
      role: 'STUDENT',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    },
  });

  const allUsers = [admin, coordinator1, coordinator2, student1, student2, student3];
  for (const u of allUsers) {
    await prisma.notificationPreference.create({
      data: {
        userId: u.id,
        emailEventReminders: true,
        emailTaskUpdates: true,
        emailRecruitment: true,
        inAppAnnouncements: true,
        inAppTasks: true,
        inAppEvents: true,
      },
    });
  }

  // 2. Create the 25 NITW Campus Clubs
  const clubsData = [
    {
      name: 'Photography Club',
      slug: 'photography-club',
      description: 'Capturing campus moments, visual storytelling, photo exhibitions, photo-walks, and masterclasses in digital photography and editing.',
      category: 'CULTURAL',
      facultyCoordinator: 'Prof. Satti Venu Gopala Kumari',
      contactPhone: '8897489096',
      contactEmail: 'svenu@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1000',
    },
    {
      name: 'Science & Astronomy Club',
      slug: 'science-astronomy-club',
      description: 'Fostering scientific curiosity, night-sky gazing, telescope observations, astrophotography, and seminars on physics and astrophysics.',
      category: 'ACADEMIC',
      facultyCoordinator: 'Prof. Satyanand Abraham',
      contactPhone: '9820727846',
      contactEmail: 'abrahams@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1000',
    },
    {
      name: 'Literary & Debating Club',
      slug: 'literary-debating-club',
      description: 'The premier forum for parliamentary debates, creative writing, poetry slams, public speaking, model united nations, and literary publications.',
      category: 'CULTURAL',
      facultyCoordinator: 'Prof. Satyam Gupta',
      contactPhone: '9452887114',
      contactEmail: 'gsatyam@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1000',
    },
    {
      name: 'Painting & Animation Club',
      slug: 'painting-animation-club',
      description: 'Nurturing visual artists, illustrators, 2D/3D animators, digital painters, and conducting fine arts exhibitions across the campus.',
      category: 'CULTURAL',
      facultyCoordinator: 'Prof. Anbumathi P',
      contactPhone: '8056628775',
      contactEmail: 'anbu@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1000',
    },
    {
      name: 'Dance & Dramatic Club',
      slug: 'dance-dramatic-club',
      description: 'Bringing stories alive through stage plays, street plays (nukkad natak), classical and contemporary dance performances, and theatrical workshops.',
      category: 'CULTURAL',
      facultyCoordinator: 'Prof. Leela Manohar Aeshala',
      studentCoordinatorId: coordinator2.id,
      contactPhone: '8351988928',
      contactEmail: 'leela_manohar@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000',
    },
    {
      name: 'Business & Finance Club',
      slug: 'business-finance-club',
      description: 'Empowering students with financial literacy, stock pitch competitions, algorithmic trading simulations, market research, and wealth management workshops.',
      category: 'ENTREPRENEURSHIP',
      facultyCoordinator: 'Prof. Muhammed Shafi M. K.',
      contactPhone: '7207447589',
      contactEmail: 'shafimk@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1000',
    },
    {
      name: 'TEDx & Quiz Club',
      slug: 'tedx-quiz-club',
      description: 'Hosting TEDx events, intellectual trivia contests, general knowledge challenges, and thought-provoking speaker sessions with global leaders.',
      category: 'ACADEMIC',
      facultyCoordinator: 'Prof. Surya Kanta Ghosh',
      contactPhone: '9820702782',
      contactEmail: 'skghosh@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000',
    },
    {
      name: 'R & D Club',
      slug: 'rnd-club',
      description: 'Promoting student-led multidisciplinary research, patent applications, research paper publications, and high-impact innovative prototypes.',
      category: 'TECHNICAL',
      facultyCoordinator: 'Prof. M. Srinivas, CS',
      contactPhone: '8897064421',
      contactEmail: 'msv@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1000',
    },
    {
      name: 'Music & Film Club',
      slug: 'music-film-club',
      description: 'Uniting passionate vocalists, instrumental bands, short filmmakers, sound engineers, and hosting campus musical festivals and film screenings.',
      category: 'CULTURAL',
      facultyCoordinator: 'Ch. Sampath Kumar',
      contactPhone: '8331071528',
      contactEmail: 'drsam@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1000',
    },
    {
      name: 'Nature & Value Education Club',
      slug: 'nature-value-education-club',
      description: 'Inspiring ethical leadership, wildlife conservation, nature trekking, mindfulness sessions, and values-based holistic education.',
      category: 'SOCIAL',
      facultyCoordinator: 'Prof. Surajbhan Sevda',
      contactPhone: '9929565697',
      contactEmail: 'sevdasuraj@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1000',
    },
    {
      name: 'Health & Fitness Club',
      slug: 'health-fitness-club',
      description: 'Promoting athletic fitness, calisthenics, gym guidance, yoga, nutrition awareness, marathon training, and active wellness on campus.',
      category: 'SPORTS',
      facultyCoordinator: 'Prof. Prakash Kodali',
      contactPhone: '8074035659',
      contactEmail: 'Kprakash@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1000',
    },
    {
      name: 'Software Development Club',
      slug: 'software-development-club',
      description: 'The premier software engineering collective building open-source projects, campus utilities, full-stack web and mobile apps, and hackathons.',
      category: 'TECHNICAL',
      facultyCoordinator: 'Prof. Shivadarshan S. L.',
      studentCoordinatorId: coordinator1.id,
      contactPhone: '9743413637',
      contactEmail: 'shivadarshan@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000',
    },
    {
      name: 'Sustainability Club',
      slug: 'sustainability-club',
      description: 'Championing environmental stewardship, zero-waste initiatives, renewable energy campaigns, green campus audits, and tree plantations.',
      category: 'SOCIAL',
      facultyCoordinator: 'Prof. Srinivasan Pradabane',
      contactPhone: '8332969289',
      contactEmail: 'spradabane@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1000',
    },
    {
      name: 'Ek Bharat Shreshtha Bharat',
      slug: 'ek-bharat-shreshtha-bharat',
      description: 'Celebrating the cultural diversity of India, inter-state language exchange, folklore, traditional arts, and national unity festivals.',
      category: 'CULTURAL',
      facultyCoordinator: 'Puttapati Sampath Kumar',
      contactPhone: '8497968889',
      contactEmail: 'pskr@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1000',
    },
    {
      name: 'SPIC-MACAY Heritage',
      slug: 'spic-macay-heritage',
      description: 'Promoting Indian classical music, classical dance traditions, folk crafts, and hosting national maestro lecture-demonstrations.',
      category: 'CULTURAL',
      facultyCoordinator: 'Prof. Bhookya Nagu',
      contactPhone: '8332969287',
      contactEmail: 'nagubhukya@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1000',
    },
    {
      name: 'Robotics Club',
      slug: 'robotics-club',
      description: 'Designing autonomous rovers, combat bots, drone swarms, industrial automation systems, and competing in national and global Robocon events.',
      category: 'TECHNICAL',
      facultyCoordinator: 'Prof. Krishna Prakash Yadav',
      contactPhone: '9451134843',
      contactEmail: 'kpyadav@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000',
    },
    {
      name: 'Youth Red Cross',
      slug: 'youth-red-cross',
      description: 'Humanitarian service society organizing blood donation drives, certified first-aid workshops, disaster preparedness, and community health camps.',
      category: 'SOCIAL',
      facultyCoordinator: 'Prof. Sweta Kumari',
      contactPhone: '8797989659',
      contactEmail: 'ksweta@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1000',
    },
    {
      name: 'Entrepreneurship Club',
      slug: 'entrepreneurship-club',
      description: 'Igniting student ventures through incubation support, founder fireside chats, pitch days, venture capital connects, and E-Summit.',
      category: 'ENTREPRENEURSHIP',
      facultyCoordinator: 'Prof. Altaf Q. H. Badar',
      contactPhone: '9890068893',
      contactEmail: 'altafbadar@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000',
    },
    {
      name: 'Satellite & Electronic Amateur Club',
      slug: 'satellite-electronic-amateur-club',
      description: 'Pioneering student satellite payloads, CubeSat telemetry, RF receiver design, high-frequency circuits, and space communication experiments.',
      category: 'TECHNICAL',
      facultyCoordinator: 'Prof. Chayan Bhar',
      contactPhone: '7908826629',
      contactEmail: 'cbhar@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000',
    },
    {
      name: 'Innovation Garage',
      slug: 'innovation-garage',
      description: 'The 24/7 maker and prototyping hub equipped with 3D printers, laser cutters, embedded hardware benches, and rapid prototyping tools.',
      category: 'ENTREPRENEURSHIP',
      facultyCoordinator: 'Prof. Prasanth Anand Kumar L.',
      contactPhone: '9840845194',
      contactEmail: 'prasanth_anand@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000',
    },
    {
      name: 'Media Club',
      slug: 'media-club',
      description: 'The official voice of campus life managing digital journalism, student newsletters, festival photography, podcasts, and event broadcasting.',
      category: 'OTHER',
      facultyCoordinator: 'Prof. Maroju Naresh Kumar',
      contactPhone: '7569574698',
      contactEmail: 'mnareshkumar@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000',
    },
    {
      name: 'Models & Prototype Club',
      slug: 'models-prototype-club',
      description: 'Mechanical modeling, aeromodelling, CAD simulation, miniature fabrication, and aerodynamic wind-tunnel testing for engineering innovations.',
      category: 'TECHNICAL',
      facultyCoordinator: 'Prof. S. Shankar',
      contactPhone: '8332969259',
      contactEmail: 'ss@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1000',
    },
    {
      name: 'HAM ARC Club',
      slug: 'ham-arc-club',
      description: 'Amateur radio communication, emergency disaster wireless networks, antenna construction, Morse code training, and government HAM licensing.',
      category: 'TECHNICAL',
      facultyCoordinator: 'Prof. Prithvi Pothupogu',
      contactPhone: '8332969360',
      contactEmail: 'prithvi@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000',
    },
    {
      name: 'NSS (National Service Scheme)',
      slug: 'nss-nitw',
      description: 'Fostering community service, rural school mentorship, village adoption programs, digital literacy, and environmental cleanliness drives.',
      category: 'SOCIAL',
      facultyCoordinator: 'Dr. Murali Mohan S.',
      contactPhone: '8332969403',
      contactEmail: 'murali@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1000',
    },
    {
      name: 'National Cadet Corps (NCC)',
      slug: 'ncc-nitw',
      description: 'Instilling character, military drill training, discipline, leadership, adventure expeditions, shooting practice, and national defense preparedness.',
      category: 'OTHER',
      facultyCoordinator: 'Dr. Sudheer Kumar Yamsani',
      contactPhone: '8486367769',
      contactEmail: 'skyamsani@nitw.ac.in',
      status: 'APPROVED',
      logoUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200',
      bannerUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=1000',
    },
  ];

  const createdClubs = {};
  for (const club of clubsData) {
    const created = await prisma.club.create({
      data: club,
    });
    createdClubs[club.slug] = created;
  }

  const sdcClub = createdClubs['software-development-club'];
  const danceClub = createdClubs['dance-dramatic-club'];
  const roboticsClub = createdClubs['robotics-club'];
  const photoClub = createdClubs['photography-club'];
  const igClub = createdClubs['innovation-garage'];

  // 3. Create Club Memberships
  await prisma.clubMembership.createMany({
    data: [
      { clubId: sdcClub.id, userId: coordinator1.id, role: 'COORDINATOR', status: 'ACTIVE' },
      { clubId: sdcClub.id, userId: student1.id, role: 'MEMBER', status: 'ACTIVE' },
      { clubId: sdcClub.id, userId: student2.id, role: 'CORE_MEMBER', status: 'ACTIVE' },
      { clubId: danceClub.id, userId: coordinator2.id, role: 'COORDINATOR', status: 'ACTIVE' },
      { clubId: danceClub.id, userId: student1.id, role: 'CORE_MEMBER', status: 'ACTIVE' },
      { clubId: danceClub.id, userId: student3.id, role: 'MEMBER', status: 'ACTIVE' },
      { clubId: roboticsClub.id, userId: student2.id, role: 'CORE_MEMBER', status: 'ACTIVE' },
      { clubId: photoClub.id, userId: student3.id, role: 'MEMBER', status: 'ACTIVE' },
      { clubId: igClub.id, userId: student1.id, role: 'MEMBER', status: 'ACTIVE' },
    ],
  });

  // 4. Recruitment Drives & Applications
  const sdcRecruit = await prisma.recruitmentDrive.create({
    data: {
      clubId: sdcClub.id,
      title: 'Software Development Club Core Committee Induction 2026',
      description: 'Seeking passionate full-stack developers, UI/UX designers, and open-source enthusiasts to lead high-impact campus projects.',
      requirements: 'Experience with web technologies (React/Node/Next.js) or systems programming. Strong collaborative spirit.',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
    },
  });

  const danceAuditions = await prisma.recruitmentDrive.create({
    data: {
      clubId: danceClub.id,
      title: 'Dance & Dramatic Club Annual Auditions',
      description: 'Open call for actors, classical and western dancers, scriptwriters, and stage managers for upcoming inter-collegiate fests.',
      requirements: 'Bring a 2-minute performance piece or portfolio. Open to all years and branches.',
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
    },
  });

  await prisma.recruitmentApplication.create({
    data: {
      driveId: sdcRecruit.id,
      userId: student1.id,
      statementOfPurpose: 'I have built multiple web projects and served as a volunteer for HackCampus last year. I would love to lead the frontend workshops.',
      experience: '2 years of React, Tailwind, and Node.js. Active open source contributor.',
      portfolioUrl: 'https://github.com/sneha-reddy',
      status: 'SHORTLISTED',
      reviewNotes: 'Impressive GitHub portfolio and proven volunteer track record.',
      reviewedAt: new Date(),
    },
  });

  await prisma.recruitmentApplication.create({
    data: {
      driveId: sdcRecruit.id,
      userId: student2.id,
      statementOfPurpose: 'Interested in competitive programming training and problem setting for junior students.',
      experience: 'Candidate Master on Codeforces, solved 800+ LeetCode problems.',
      portfolioUrl: 'https://codeforces.com/profile/rohit_k',
      status: 'UNDER_REVIEW',
    },
  });

  // 5. Events
  const hackCampus = await prisma.event.create({
    data: {
      clubId: sdcClub.id,
      createdById: coordinator1.id,
      title: 'HackCampus 2026: 36-Hour National Hackathon',
      slug: 'hackcampus-2026',
      description: 'The largest student hackathon on campus! Join 500+ builders, innovators, and designers for 36 hours of non-stop hacking, mentoring sessions, and exciting prizes.',
      category: 'HACKATHON',
      venue: 'Main Innovation Center & CS Auditorium',
      startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      registrationStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      registrationEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxCapacity: 120,
      registeredCount: 3,
      status: 'REGISTRATION_OPEN',
      checkInSecret: 'hackcampus-checkin-secret-token-2026',
      bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000',
    },
  });

  const danceFest = await prisma.event.create({
    data: {
      clubId: danceClub.id,
      createdById: coordinator2.id,
      title: 'Rhythm & Expressions: Annual Theatre & Dance Gala',
      slug: 'rhythm-and-expressions-2026',
      description: 'An evening celebrating regional musical heritage, theatrical drama, contemporary fusion choreography, and live performances.',
      category: 'CULTURAL_FEST',
      venue: 'Open Air Amphitheatre',
      startDateTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      registrationStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      registrationEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      maxCapacity: 250,
      registeredCount: 1,
      status: 'REGISTRATION_OPEN',
      checkInSecret: 'dance-fest-secret-token-2026',
      bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000',
    },
  });

  const aiWorkshop = await prisma.event.create({
    data: {
      clubId: sdcClub.id,
      createdById: coordinator1.id,
      title: 'Building Enterprise LLM Agents Workshop',
      slug: 'enterprise-llm-agents-workshop',
      description: 'Hands-on intensive masterclass on building retrieval-augmented generation (RAG) agents, function-calling models, and vector stores.',
      category: 'WORKSHOP',
      venue: 'Advanced Computing Lab 4B',
      startDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      registrationStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      registrationEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      maxCapacity: 50,
      registeredCount: 2,
      status: 'REGISTRATION_OPEN',
      checkInSecret: 'llm-workshop-secret-token-2026',
      bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000',
    },
  });

  // 6. Event Registrations
  await prisma.eventRegistration.createMany({
    data: [
      {
        eventId: hackCampus.id,
        userId: student1.id,
        ticketCode: 'TKT-HC26-8901',
        status: 'REGISTERED',
      },
      {
        eventId: hackCampus.id,
        userId: student2.id,
        ticketCode: 'TKT-HC26-8902',
        status: 'REGISTERED',
      },
      {
        eventId: hackCampus.id,
        userId: student3.id,
        ticketCode: 'TKT-HC26-8903',
        status: 'REGISTERED',
      },
      {
        eventId: danceFest.id,
        userId: student1.id,
        ticketCode: 'TKT-DF26-9001',
        status: 'REGISTERED',
      },
      {
        eventId: aiWorkshop.id,
        userId: student1.id,
        ticketCode: 'TKT-AI26-4401',
        status: 'REGISTERED',
      },
      {
        eventId: aiWorkshop.id,
        userId: student2.id,
        ticketCode: 'TKT-AI26-4402',
        status: 'REGISTERED',
      },
    ],
  });

  // 7. Volunteer Opportunities
  const volOpp1 = await prisma.volunteerOpportunity.create({
    data: {
      eventId: hackCampus.id,
      roleTitle: 'Registration & Participant Check-In Lead',
      description: 'Manage the front desk, scan QR tickets, distribute identity lanyards, and guide arriving hackathon teams.',
      skillsRequired: 'Good communication, punctual, familiar with mobile QR scanner.',
      volunteersNeeded: 6,
      status: 'OPEN',
    },
  });

  const volOpp2 = await prisma.volunteerOpportunity.create({
    data: {
      eventId: hackCampus.id,
      roleTitle: 'Technical Infrastructure & Wi-Fi Monitor',
      description: 'Assist teams with laboratory networking, hardware peripherals, and power distribution strips.',
      skillsRequired: 'Basic networking and hardware troubleshooting skills.',
      volunteersNeeded: 4,
      status: 'OPEN',
    },
  });

  const volOpp3 = await prisma.volunteerOpportunity.create({
    data: {
      eventId: danceFest.id,
      roleTitle: 'Stage Management & Green Room Coordinator',
      description: 'Assist artists with microphone setups, stage transitions, and coordinate with the sound engineer.',
      skillsRequired: 'Organized, cool-headed under pressure.',
      volunteersNeeded: 5,
      status: 'OPEN',
    },
  });

  // Volunteer Application & Assignment
  await prisma.volunteerApplication.create({
    data: {
      opportunityId: volOpp1.id,
      userId: student1.id,
      note: 'I helped coordinate registration during orientation week last semester and loved the energy!',
      status: 'ACCEPTED',
      reviewedAt: new Date(),
    },
  });

  await prisma.volunteerAssignment.create({
    data: {
      opportunityId: volOpp1.id,
      eventId: hackCampus.id,
      userId: student1.id,
      roleName: 'Registration & Participant Check-In Lead',
      reportingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000), // 1 hour before
      reportingVenue: 'Main Innovation Center Front Desk',
      status: 'ASSIGNED',
      notes: 'Please pick up the barcode badge printer from Room 204 at 8:00 AM.',
    },
  });

  await prisma.volunteerApplication.create({
    data: {
      opportunityId: volOpp2.id,
      userId: student2.id,
      note: 'CS sophomore, happy to help with network routers and switches.',
      status: 'ACCEPTED',
      reviewedAt: new Date(),
    },
  });

  await prisma.volunteerAssignment.create({
    data: {
      opportunityId: volOpp2.id,
      eventId: hackCampus.id,
      userId: student2.id,
      roleName: 'Technical Infrastructure & Wi-Fi Monitor',
      reportingTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
      reportingVenue: 'Innovation Center Server Room',
      status: 'ASSIGNED',
      notes: 'Coordinate with Campus IT for network switch passwords.',
    },
  });

  // 8. Tasks
  const task1 = await prisma.task.create({
    data: {
      eventId: hackCampus.id,
      assignedToUserId: student1.id,
      title: 'Inspect QR Check-In Scanners and Print 120 Badges',
      description: 'Ensure the Campus Crew check-in scanners are charged, test QR scan verification, and print attendee badges.',
      priority: 'HIGH',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
      verifiedById: coordinator1.id,
      verifiedAt: new Date(),
      pointsValue: 10,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      eventId: hackCampus.id,
      assignedToUserId: student2.id,
      title: 'Configure Dedicated Wi-Fi SSIDs and Power Drops',
      description: 'Coordinate with university network admins to allocate high-bandwidth SSIDs for 30 participating hackathon teams.',
      priority: 'URGENT',
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      pointsValue: 15,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      eventId: hackCampus.id,
      assignedToUserId: student1.id,
      title: 'Organize Sponsor Swag Bags and Participant Kits',
      description: 'Sort and bag t-shirts, stickers, notebooks, and sponsor merchandise for distribution at the front desk.',
      priority: 'MEDIUM',
      deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      pointsValue: 5,
    },
  });

  // Task Comments
  await prisma.taskComment.create({
    data: {
      taskId: task1.id,
      userId: student1.id,
      comment: 'All 120 attendee badges have been sorted alphabetically into boxes by college name.',
    },
  });

  await prisma.taskComment.create({
    data: {
      taskId: task1.id,
      userId: coordinator1.id,
      comment: 'Excellent work Sneha! Verified and awarded 10 contribution points.',
    },
  });

  // 9. Announcements
  await prisma.announcement.create({
    data: {
      clubId: sdcClub.id,
      authorId: coordinator1.id,
      title: '🎉 Welcome to HackCampus 2026 Preparation!',
      content: 'We are thrilled to announce HackCampus 2026! Registrations are now open. Volunteers please check your assigned tasks and reporting times.',
      targetRole: 'ALL',
      isPinned: true,
    },
  });

  await prisma.announcement.create({
    data: {
      clubId: sdcClub.id,
      eventId: hackCampus.id,
      authorId: coordinator1.id,
      title: 'Volunteer Briefing Meeting Schedule',
      content: 'All accepted volunteers for HackCampus must attend the mandatory briefing on Thursday at 5:00 PM in CS Lab 2.',
      targetRole: 'VOLUNTEERS',
      isPinned: false,
    },
  });

  // 10. Attendance Records
  await prisma.attendance.create({
    data: {
      eventId: aiWorkshop.id,
      userId: student1.id,
      markedById: coordinator1.id,
      method: 'QR_SCAN',
      checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  // 11. Contributions & Points
  await prisma.contribution.create({
    data: {
      userId: student1.id,
      clubId: sdcClub.id,
      eventId: hackCampus.id,
      points: 10,
      reason: 'Completed QR scanner check and badge printing task with stellar accuracy',
      category: 'TASK_COMPLETION',
      verifiedById: coordinator1.id,
    },
  });

  await prisma.contribution.create({
    data: {
      userId: student1.id,
      clubId: sdcClub.id,
      eventId: aiWorkshop.id,
      points: 5,
      reason: 'Active attendance and engagement in LLM Masterclass',
      category: 'VOLUNTEER_WORK',
      verifiedById: coordinator1.id,
    },
  });

  await prisma.contribution.create({
    data: {
      userId: student2.id,
      clubId: sdcClub.id,
      eventId: hackCampus.id,
      points: 10,
      reason: 'Assisted in network setup and hardware configuration',
      category: 'VOLUNTEER_WORK',
      verifiedById: coordinator1.id,
    },
  });

  // 12. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'Task Verified: 10 Points Awarded! 🌟',
        message: 'Your task "Inspect QR Check-In Scanners and Print 120 Badges" has been verified by Arjun Sharma.',
        type: 'TASK_STATUS',
        linkUrl: '/student/tasks',
        isRead: false,
      },
      {
        userId: student1.id,
        title: 'Volunteer Application Accepted!',
        message: 'You have been appointed as Registration & Participant Check-In Lead for HackCampus 2026.',
        type: 'VOLUNTEER_STATUS',
        linkUrl: '/student/volunteer-tasks',
        isRead: true,
        readAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        userId: student1.id,
        title: 'Event Registration Confirmed: HackCampus 2026',
        message: 'Your registration ticket TKT-HC26-8901 is confirmed. Check details in your events dashboard.',
        type: 'REGISTRATION_CONFIRMED',
        linkUrl: '/student/events',
        isRead: true,
        readAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      },
      {
        userId: student2.id,
        title: 'Urgent Task Assigned: Wi-Fi Setup',
        message: 'You have been assigned to configure dedicated Wi-Fi SSIDs for HackCampus 2026.',
        type: 'TASK_ASSIGNED',
        linkUrl: '/student/tasks',
        isRead: false,
      },
    ],
  });

  console.log(`✅ Seeding completed successfully! Created ${clubsData.length} campus clubs.`);
  console.log('--- DEFAULT CREDENTIALS ---');
  console.log('Admin:       admin@campuscrew.edu       / Password123!');
  console.log('Coordinator: coordinator@campuscrew.edu / Password123!');
  console.log('Student:     student@campuscrew.edu     / Password123!');
  console.log('---------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

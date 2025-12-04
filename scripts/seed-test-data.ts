import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'test-user@example.com';

  // 1. Create or get User
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Check if username exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username: 'testuser' },
    });

    if (existingUserByUsername) {
      user = existingUserByUsername;
    } else {
      user = await prisma.user.create({
        data: {
          email,
          username: 'testuser',
          password: 'hashedpassword',
        },
      });
    }
  }

  // 2. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'E2E Test Project',
      description: 'This is a test project for E2E testing.',
      consentInfo: 'Please consent to the terms.',
      imageCount: 2,
      imageDuration: 3, // 3 seconds for quick testing
      userId: user.id,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      evaluationMethod: 'slider',
      allowMultipleAnswers: true,
      questions: {
        create: [
          {
            text: 'How do you feel about this image?',
            leftLabel: 'Bad',
            rightLabel: 'Good',
          },
          {
            text: 'Is this image interesting?',
            leftLabel: 'Boring',
            rightLabel: 'Interesting',
          },
        ],
      },
      images: {
        create: [
          { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
          { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
        ],
      },
    },
  });

  // 3. Create Radio Project
  const radioProject = await prisma.project.create({
    data: {
      name: 'E2E Radio Project',
      description: 'This is a test project for Radio Button evaluation.',
      consentInfo: 'Please consent to the terms.',
      imageCount: 1,
      imageDuration: 3,
      userId: user.id,
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      evaluationMethod: 'radio',
      allowMultipleAnswers: true,
      questions: {
        create: [
          {
            text: 'Rate this image',
            leftLabel: 'Low',
            rightLabel: 'High',
          },
        ],
      },
      images: {
        create: [
          { url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' },
        ],
      },
    },
  });

  console.log(JSON.stringify({ sliderProjectId: project.id, radioProjectId: radioProject.id }));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

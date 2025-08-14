import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create topics
  const topics = await Promise.all([
    prisma.topic.upsert({
      where: { slug: 'penal' },
      update: {},
      create: {
        slug: 'penal',
        title: 'Direito Penal',
      },
    }),
    prisma.topic.upsert({
      where: { slug: 'civil' },
      update: {},
      create: {
        slug: 'civil',
        title: 'Direito Civil',
      },
    }),
    prisma.topic.upsert({
      where: { slug: 'constitucional' },
      update: {},
      create: {
        slug: 'constitucional',
        title: 'Direito Constitucional',
      },
    }),
    prisma.topic.upsert({
      where: { slug: 'trabalhista' },
      update: {},
      create: {
        slug: 'trabalhista',
        title: 'Direito Trabalhista',
      },
    }),
    prisma.topic.upsert({
      where: { slug: 'administrativo' },
      update: {},
      create: {
        slug: 'administrativo',
        title: 'Direito Administrativo',
      },
    }),
  ]);

  console.log('✅ Topics created');

  // Create professors
  const passwordHash = await bcrypt.hash('123456', 12);

  const professor1 = await prisma.user.upsert({
    where: { email: 'ana.silva@legaltok.com' },
    update: {},
    create: {
      name: 'Dra. Ana Silva',
      email: 'ana.silva@legaltok.com',
      passwordHash,
      role: 'PROFESSOR',
      bio: 'Especialista em Direito Trabalhista com mais de 15 anos de experiência.',
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  });

  const professor2 = await prisma.user.upsert({
    where: { email: 'carlos.santos@legaltok.com' },
    update: {},
    create: {
      name: 'Prof. Carlos Santos',
      email: 'carlos.santos@legaltok.com',
      passwordHash,
      role: 'PROFESSOR',
      bio: 'Advogado criminalista e professor de Direito Penal.',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  });

  const professor3 = await prisma.user.upsert({
    where: { email: 'maria.costa@legaltok.com' },
    update: {},
    create: {
      name: 'Dra. Maria Costa',
      email: 'maria.costa@legaltok.com',
      passwordHash,
      role: 'PROFESSOR',
      bio: 'Especialista em Direito do Consumidor e Direito Civil.',
      avatarUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  });

  console.log('✅ Professors created');

  // Create professor profiles
  await Promise.all([
    prisma.professorProfile.upsert({
      where: { userId: professor1.id },
      update: {},
      create: {
        userId: professor1.id,
        specialties: ['Trabalhista', 'Previdenciário'],
        verified: true,
        links: {
          website: 'https://anasilva.adv.br',
          instagram: '@anasilva_adv',
          linkedin: 'ana-silva-adv',
          whatsapp: '+5511999999999',
        },
      },
    }),
    prisma.professorProfile.upsert({
      where: { userId: professor2.id },
      update: {},
      create: {
        userId: professor2.id,
        specialties: ['Penal', 'Processo Penal'],
        verified: true,
        links: {
          website: 'https://carlossantos.adv.br',
          instagram: '@carlossantos_penal',
          linkedin: 'carlos-santos-penal',
        },
      },
    }),
    prisma.professorProfile.upsert({
      where: { userId: professor3.id },
      update: {},
      create: {
        userId: professor3.id,
        specialties: ['Consumidor', 'Civil'],
        verified: true,
        links: {
          website: 'https://mariacosta.adv.br',
          instagram: '@mariacosta_law',
          linkedin: 'maria-costa-consumidor',
        },
      },
    }),
  ]);

  console.log('✅ Professor profiles created');

  // Create some students
  const student1 = await prisma.user.upsert({
    where: { email: 'joao.aluno@email.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'joao.aluno@email.com',
      passwordHash,
      role: 'ALUNO',
      bio: 'Estudante de Direito apaixonado por aprender.',
      avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'maria.aluna@email.com' },
    update: {},
    create: {
      name: 'Maria Oliveira',
      email: 'maria.aluna@email.com',
      passwordHash,
      role: 'ALUNO',
      bio: 'Estudante de Direito focada em concursos.',
      avatarUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  });

  console.log('✅ Students created');

  // Create sample videos (with empty files for demo)
  const sampleVideos = [
    {
      title: 'Como calcular horas extras corretamente',
      description: 'Aprenda a calcular horas extras de acordo com a CLT',
      tags: ['Trabalhista', 'HorasExtras', 'CLT'],
      durationSec: 45,
      authorId: professor1.id,
      topicSlugs: ['trabalhista'],
    },
    {
      title: 'Diferença entre crime doloso e culposo',
      description: 'Entenda as principais diferenças entre dolo e culpa no Direito Penal',
      tags: ['Penal', 'Crime', 'Dolo'],
      durationSec: 60,
      authorId: professor2.id,
      topicSlugs: ['penal'],
    },
    {
      title: 'Seus direitos na compra online',
      description: 'Conheça seus direitos como consumidor em compras pela internet',
      tags: ['Consumidor', 'CompraOnline', 'CDC'],
      durationSec: 38,
      authorId: professor3.id,
      topicSlugs: ['civil'],
    },
    {
      title: 'Quando o patrão pode descontar do salário',
      description: 'Situações em que o empregador pode fazer descontos salariais',
      tags: ['Trabalhista', 'Salario', 'Desconto'],
      durationSec: 52,
      authorId: professor1.id,
      topicSlugs: ['trabalhista'],
    },
    {
      title: 'Princípios constitucionais fundamentais',
      description: 'Os principais princípios que regem nossa Constituição',
      tags: ['Constitucional', 'Principios', 'CF88'],
      durationSec: 48,
      authorId: professor2.id,
      topicSlugs: ['constitucional'],
    },
    {
      title: 'Responsabilidade civil do Estado',
      description: 'Quando o Estado pode ser responsabilizado por danos',
      tags: ['Administrativo', 'Estado', 'Responsabilidade'],
      durationSec: 55,
      authorId: professor3.id,
      topicSlugs: ['administrativo'],
    },
    {
      title: 'Direitos trabalhistas na pandemia',
      description: 'Como a pandemia afetou os direitos trabalhistas',
      tags: ['Trabalhista', 'Pandemia', 'Teletrabalho'],
      durationSec: 42,
      authorId: professor1.id,
      topicSlugs: ['trabalhista'],
    },
    {
      title: 'Habeas Corpus: quando usar',
      description: 'Guia completo sobre o remédio constitucional Habeas Corpus',
      tags: ['Constitucional', 'HabeasCorpus', 'Liberdade'],
      durationSec: 58,
      authorId: professor2.id,
      topicSlugs: ['constitucional'],
    },
    {
      title: 'Contratos de consumo: o que você precisa saber',
      description: 'Principais pontos sobre contratos de consumo',
      tags: ['Consumidor', 'Contratos', 'CDC'],
      durationSec: 44,
      authorId: professor3.id,
      topicSlugs: ['civil'],
    },
    {
      title: 'Licitações públicas: conceitos básicos',
      description: 'Introdução ao sistema de licitações públicas',
      tags: ['Administrativo', 'Licitação', 'Público'],
      durationSec: 50,
      authorId: professor1.id,
      topicSlugs: ['administrativo'],
    },
  ];

  for (const videoData of sampleVideos) {
    const video = await prisma.video.create({
      data: {
        title: videoData.title,
        description: videoData.description,
        tags: videoData.tags,
        durationSec: videoData.durationSec,
        authorId: videoData.authorId,
        fileUrl: '/uploads/sample-video.mp4', // Placeholder
        thumbUrl: '/uploads/sample-thumb.jpg', // Placeholder
        status: 'READY',
        views: Math.floor(Math.random() * 10000) + 100,
      },
    });

    // Connect video to topics
    for (const topicSlug of videoData.topicSlugs) {
      const topic = topics.find(t => t.slug === topicSlug);
      if (topic) {
        await prisma.videoTopic.create({
          data: {
            videoId: video.id,
            topicId: topic.id,
          },
        });
      }
    }
  }

  console.log('✅ Sample videos created');

  // Create some follows
  await Promise.all([
    prisma.follow.create({
      data: {
        followerId: student1.id,
        followingId: professor1.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: student1.id,
        followingId: professor2.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: student2.id,
        followingId: professor1.id,
      },
    }),
    prisma.follow.create({
      data: {
        followerId: student2.id,
        followingId: professor3.id,
      },
    }),
  ]);

  console.log('✅ Follows created');

  // Create some likes
  const videos = await prisma.video.findMany();
  for (const video of videos.slice(0, 5)) {
    await Promise.all([
      prisma.like.create({
        data: {
          userId: student1.id,
          videoId: video.id,
        },
      }),
      prisma.like.create({
        data: {
          userId: student2.id,
          videoId: video.id,
        },
      }),
    ]);
  }

  console.log('✅ Likes created');

  // Create some comments
  const comments = [
    'Excelente explicação! Muito claro.',
    'Vou usar isso no meu TCC, obrigado!',
    'Professor, tem algum material complementar?',
    'Muito bom, parabéns pelo conteúdo!',
    'Isso vai cair na prova, certeza!',
  ];

  for (let i = 0; i < 10; i++) {
    const video = videos[Math.floor(Math.random() * videos.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    const author = [student1, student2][Math.floor(Math.random() * 2)];

    await prisma.comment.create({
      data: {
        videoId: video.id,
        authorId: author.id,
        text: comment,
      },
    });
  }

  console.log('✅ Comments created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📋 Sample data created:');
  console.log(`- ${topics.length} topics`);
  console.log(`- 3 professors with profiles`);
  console.log(`- 2 students`);
  console.log(`- ${sampleVideos.length} sample videos`);
  console.log('- Follow relationships');
  console.log('- Sample likes and comments');
  console.log('\n🔑 Login credentials:');
  console.log('Professor 1: ana.silva@legaltok.com / 123456');
  console.log('Professor 2: carlos.santos@legaltok.com / 123456');
  console.log('Professor 3: maria.costa@legaltok.com / 123456');
  console.log('Student 1: joao.aluno@email.com / 123456');
  console.log('Student 2: maria.aluna@email.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

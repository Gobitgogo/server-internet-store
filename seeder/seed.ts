import { faker } from '@faker-js/faker';
import { PrismaClient, Product } from '@prisma/client';
import * as dotenv from 'dotenv';

function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // заменить все символы не буквенно-цифровые на "-"
    .replace(/(^-|-$)+/g, ''); // убрать "-" в начале и конце строки
}

function getRandomNumber() {
  // генерация случайного числа от 1 до 5
  return Math.floor(Math.random() * 5) + 1;
}

dotenv.config();

const prisma = new PrismaClient();

const createProducts = async (quantity: number) => {
  const products: Product[] = [];

  for (let i = 0; i < quantity; i++) {
    const productName = faker.commerce.productName();
    const categoryName = faker.commerce.department();

    const product = await prisma.product.create({
      data: {
        name: productName,
        slug: generateSlug(productName),
        description: faker.commerce.productDescription(),
        price: +faker.commerce.price(10, 999, 0),
        images: Array.from({ length: getRandomNumber() }).map(() =>
          faker.image.imageUrl(),
        ),
        category: {
          create: {
            name: categoryName,
            slug: generateSlug(categoryName),
          },
        },
        reviews: {
          create: [
            {
              rating: faker.datatype.number({ min: 1, max: 10 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: '64293ecfc9eb96ec93981396',
                },
              },
            },
            {
              rating: faker.datatype.number({ min: 1, max: 10 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: '64293ecfc9eb96ec93981396',
                },
              },
            },
          ],
        },
      },
    });

    products.push(product);
  }

  console.log(`Createt ${products.length} products`);
};

async function main() {
  console.log('start seeding...');
  await createProducts(10);
}
main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

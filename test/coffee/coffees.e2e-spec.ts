import { HttpServer, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateCoffeeDto } from 'src/coffees/dto/create-coffee.dto';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { UpdateCoffeeDto } from '../../src/coffees/dto/update-coffee.dto';

/* 💡💡 IMPORTANT NOTE 💡💡
  Sometimes when errors happen within npm scripts (such as the tests we're 
  running inside test:e2e), post hooks won't run! 
  
  You have a few options here, when these error happen, you can:
  
  1) Manually run the `posttest:e2e` hook.
  
  2) Use a library like `npm-run-all` (npm i --D npm-run-all) and use 
     the --continue-on-error flag to make sure everything still runs, moving the "post" hook
     into an npm script to be ran
     
  For example:
  
  "pretest:e2e": "docker-compose up -d test-db",
  "run:jest": "jest --config ./test/jest-e2e.json",
  "test:e2e": "npm-run-all the-actual-test run-after-test-even-if-failed --continue-on-error",
  "test:e2e:teardown": "docker-compose stop test-db && docker-compose rm -f test-db"
*/

describe('[Feature] Coffees - /coffees', () => {
  const coffee = {
    name: 'Shipwreck Roast',
    brand: 'Buddy Brew',
    flavors: ['chocolate', 'vanilla'],
  };

  const updatedCoffee = {
    id: 1,
    name: 'Shipwreck Roast Updated',
    brand: 'Buddy Brew',
    recommendations: 0,
  };

  let app: INestApplication;
  let httpServer: HttpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();
  });

  it('Create [POST /]', () => {
    return request(app.getHttpServer())
      .post('/coffees')
      .send(coffee as CreateCoffeeDto)
      .expect(HttpStatus.CREATED)
      .then(({ body }) => {
        const expectedCoffee = expect.objectContaining({
          ...coffee,
          flavors: expect.arrayContaining(
            coffee.flavors.map((name) => expect.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffee);
      });
  });

  it('Get one [GET /]', () => {
    return request(app.getHttpServer())
      .get('/coffees/1')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffee = expect.objectContaining({
          ...coffee,
          flavors: expect.arrayContaining(
            coffee.flavors.map((name) => expect.objectContaining({ name })),
          ),
        });
        expect(body).toEqual(expectedCoffee);
      });
  });

  it('Get all [GET /]', () => {
    return request(app.getHttpServer())
      .get('/coffees')
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        const expectedCoffee = expect.objectContaining({
          ...coffee,
          flavors: expect.arrayContaining(
            coffee.flavors.map((name) => expect.objectContaining({ name })),
          ),
        });
        expect(body.length).toBeGreaterThan(0);
        expect(body[0]).toEqual(expectedCoffee);
      });
  });

  it('Update one [PATCH /]', () => {
    return request(app.getHttpServer())
      .patch('/coffees/1')
      .send({ name: 'Shipwreck Roast Updated' } as UpdateCoffeeDto)
      .expect(HttpStatus.OK)
      .then(({ body }) => {
        expect(body).toEqual(updatedCoffee);
      });
  });

  //### FORMATION PATCH TEST UNIT ###
  it('Update one [PATCH /:id]', () => {
    const updateCoffeeDto: UpdateCoffeeDto = {
      ...coffee,
      name: 'New and Improved Shipwreck Roast',
    };
    return request(app.getHttpServer())
      .patch('/coffees/1')
      .send(updateCoffeeDto)
      .then(({ body }) => {
        expect(body.name).toEqual(updateCoffeeDto.name);

        return request(app.getHttpServer())
          .get('/coffees/1')
          .then(({ body }) => {
            expect(body.name).toEqual(updateCoffeeDto.name);
          });
      });
  });

  it('Delete one [DELETE /]', () => {
    return request(app.getHttpServer())
      .patch('/coffees/1')
      .expect(HttpStatus.OK);
  });

  //### FORMATION PATCH TEST UNIT ###
  it('Delete one [DELETE /:id]', () => {
    return request(app.getHttpServer())
      .delete('/coffees/1')
      .expect(HttpStatus.OK)
      .then(() => {
        return request(app.getHttpServer())
          .get('/coffees/1')
          .expect(HttpStatus.NOT_FOUND);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

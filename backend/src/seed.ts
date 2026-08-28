import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Gender, UserStatus } from './common/enums';
import { User } from './users/entities/user.entity';

const ADMIN = {
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@example.com',
  password: 'Admin@123',
  phoneNumber: '+1 555 0100',
  dateOfBirth: '1990-01-15',
  gender: Gender.OTHER,
  address: '1 Admin Plaza',
  city: 'New York',
  country: 'United States',
  status: UserStatus.ACTIVE,
};

const SAMPLE_USERS = [
  ['Aswin', 'Kumar', 'aswin.kumar@example.com', '+91 98450 11223', '1994-03-12', Gender.MALE, '42 MG Road', 'Bengaluru', 'India', UserStatus.ACTIVE],
  ['Sara', 'Mathew', 'sara.mathew@example.com', '+91 98765 43210', '1996-07-22', Gender.FEMALE, '8 Marine Drive', 'Kochi', 'India', UserStatus.ACTIVE],
  ['Daniel', 'Okafor', 'daniel.okafor@example.com', '+234 803 555 0142', '1988-11-02', Gender.MALE, '17 Awolowo Way', 'Lagos', 'Nigeria', UserStatus.INACTIVE],
  ['Emily', 'Carter', 'emily.carter@example.com', '+1 415 555 0177', '1992-05-30', Gender.FEMALE, '900 Market St', 'San Francisco', 'United States', UserStatus.ACTIVE],
  ['Hiroshi', 'Tanaka', 'hiroshi.tanaka@example.com', '+81 90 1234 5678', '1985-09-14', Gender.MALE, '3-1 Shibuya', 'Tokyo', 'Japan', UserStatus.ACTIVE],
  ['Fatima', 'Al Mansoori', 'fatima.almansoori@example.com', '+971 50 555 0188', '1997-01-08', Gender.FEMALE, '12 Sheikh Zayed Rd', 'Dubai', 'United Arab Emirates', UserStatus.ACTIVE],
  ['Lucas', 'Silva', 'lucas.silva@example.com', '+55 11 95555 0123', '1991-12-19', Gender.MALE, '55 Av. Paulista', 'Sao Paulo', 'Brazil', UserStatus.INACTIVE],
  ['Anna', 'Kowalski', 'anna.kowalski@example.com', '+48 601 555 012', '1993-04-25', Gender.FEMALE, '21 Nowy Swiat', 'Warsaw', 'Poland', UserStatus.ACTIVE],
  ['Mohammed', 'Rahman', 'mohammed.rahman@example.com', '+880 171 555 0199', '1989-08-11', Gender.MALE, '9 Gulshan Ave', 'Dhaka', 'Bangladesh', UserStatus.ACTIVE],
  ['Chloe', 'Dubois', 'chloe.dubois@example.com', '+33 6 55 55 01 23', '1995-02-17', Gender.FEMALE, '14 Rue de Rivoli', 'Paris', 'France', UserStatus.ACTIVE],
  ['Alex', 'Rivera', 'alex.rivera@example.com', '+1 212 555 0166', '1998-06-05', Gender.OTHER, '77 Broadway', 'New York', 'United States', UserStatus.ACTIVE],
  ['Priya', 'Nair', 'priya.nair@example.com', '+91 99887 66554', '1990-10-28', Gender.FEMALE, '31 Anna Salai', 'Chennai', 'India', UserStatus.INACTIVE],
  ['Liam', "O'Brien", 'liam.obrien@example.com', '+353 85 555 0134', '1987-03-03', Gender.MALE, '5 Grafton St', 'Dublin', 'Ireland', UserStatus.ACTIVE],
  ['Mei', 'Chen', 'mei.chen@example.com', '+86 138 5555 0122', '1994-11-21', Gender.FEMALE, '88 Nanjing Rd', 'Shanghai', 'China', UserStatus.ACTIVE],
  ['Noah', 'Muller', 'noah.muller@example.com', '+49 151 5555 0177', '1986-07-09', Gender.MALE, '4 Unter den Linden', 'Berlin', 'Germany', UserStatus.ACTIVE],
] as const;

async function seed() {
  const dataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'data.sqlite',
    entities: [User],
    synchronize: true,
  });

  await dataSource.initialize();
  const repository = dataSource.getRepository(User);

  const existing = await repository.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} user(s) — skipping seed.`);
    await dataSource.destroy();
    return;
  }

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  const users = [
    repository.create({
      ...ADMIN,
      password: await bcrypt.hash(ADMIN.password, 10),
    }),
    ...SAMPLE_USERS.map(
      ([firstName, lastName, email, phoneNumber, dateOfBirth, gender, address, city, country, status]) =>
        repository.create({
          firstName,
          lastName,
          email,
          password: defaultPasswordHash,
          phoneNumber,
          dateOfBirth,
          gender,
          address,
          city,
          country,
          status,
        }),
    ),
  ];

  await repository.save(users);
  await dataSource.destroy();

  console.log(`Seeded ${users.length} users.`);
  console.log(`Admin login: ${ADMIN.email} / ${ADMIN.password}`);
  console.log('Sample users share the password: Password@123');
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});

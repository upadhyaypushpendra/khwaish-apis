import faker from 'faker'

const password = 'superpassword'

export const user = {
  name: faker.name.firstName(),
  phone: faker.phone.phoneNumber(),
  about: faker.lorem.sentence(),
  password
}

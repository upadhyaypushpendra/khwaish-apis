import { Schema, Document, model } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import privateValidator from 'mongoose-private'
import { decrypt, encrypt } from "../utils/cryptoUtil";

export interface IUser {
  name: string
  phone: string
  about: string
  hash_password: string
  salt: string
  created_at: string
  updated_at: string
}

export interface IUserToAuthJSON {
  name: string
  phone: string
  about: string
}

export default interface IUserModel extends Document, IUser {
  setPassword(password: string): void;
  validPassword(password: string): boolean;
  toAuthJSON(): IUserToAuthJSON;
}

const schema = new Schema<IUserModel>(
  {
    name: {
      type: String,
      required: false,
      minlength: 3,
      maxlength: 50,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 20,
      unique: true,
    },
    about: {
      type: String,
      required: false,
      maxlength: 500,
    },
    hash_password: {
      type: String,
      private: true,
      required: true,
    },
    salt: {
      type: String,
      private: true,
      required: true,
    },
    created_at: {
      type: String,
      default: new Date().toISOString(),
    },
    updated_at: {
      type: String,
      default: new Date().toISOString(),
    },

  },
  {
    timestamps: true,
  },
)

// Plugins
schema.plugin(uniqueValidator)
schema.plugin(privateValidator)

schema.methods.setPassword = function (password: string) {
  const hash = encrypt(password);
  this.salt = hash.salt;
  this.hash_password = hash.hashedValue;
}

schema.methods.validPassword = function (password: string): boolean {
  return decrypt({ salt: this.salt, hashedValue: this.hash_password }) === password;
}

schema.methods.toAuthJSON = async function () {
  const { name, phone, about } = this;
  return {
    name,
    phone,
    about,
  }
}

export const User = model<IUserModel>('User', schema)

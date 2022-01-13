import { Schema, Document, model } from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'
import privateValidator from 'mongoose-private'

export interface IRequest {
  sender: any;
  receiver: any;
  created_at: string
  updated_at: string
}

export default interface IRequestModel extends Document, IRequest {}

const schema = new Schema<IRequestModel>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

schema.methods.toJSObject = async function () {
  const { _id ,sender, receiver, created_at, updated_at } = this;
  return {
    id: _id,
    sender,
    receiver,
    createdAt: created_at,
    updatedAt: updated_at
  }
}

export const Request = model<IRequestModel>('Request', schema)

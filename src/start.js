import { MongoClient, ObjectId } from 'mongodb'
import express from 'express'
import bodyParser from 'body-parser'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import cors from 'cors'
import { prepare } from '../util/index'
var pdf = require('html-pdf')
const path = require('path')
const app = express()
const options = {
  format: 'A4',
  border: {
    'top': '1in', // default is 0, units: mm, cm, in, px
    'right': '1in',
    'bottom': '1in',
    'left': '1in'
  },
  header: {
    height: '45mm',
    contents: '<div style="text-align: center;">Invoice</div>'
  }
}

app.use(cors())
app.use(bodyParser.text({ type: 'text/html' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
  console.log(req.body)
  res.json({ 'message': 'Welcome to advanced framework application. API is working fine.' })
})

const homePath = '/graphiql'
const URL = 'http://localhost'
const PORT = process.env.PORT || 3001
// const PORT = 3001
// const MONGO_URL = 'mongodb://localhost:27017/blog' // work with  docker
const uri = 'mongodb+srv://arvind:dangar@cluster0-cmyl5.mongodb.net/test?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true })

const dbName = 'test'

export const start = async () => {
  try {
    //  const db = await MongoClient.connect(MONGO_URL) //work with docker
    const db = await client.connect() // work with mongo online db
    const Posts = client.db(dbName).collection('posts')
    const Member = client.db(dbName).collection('member')
    const Comments = client.db(dbName).collection('comments')
    const CalenderEvent = client.db(dbName).collection('calenderEvent')
    const BookingArea = client.db(dbName).collection('bookingArea')
    const Dishesh = client.db(dbName).collection('dishesh')
    const RentingInvoice = client.db(dbName).collection('rentingInvoice')
    const InvoiceLines = client.db(dbName).collection('invoiceLines')

    const typeDefs = [`
      type Query {
        post(_id: String): Post
        posts: [Post]
        comment(_id: String): Comment
        members:[Member]
        member(_id: String): Member
        calenderEvent(_id: String): CalenderEvent
        calenderEvents: [CalenderEvent]
        bookingArea(_id: String): BookingArea
        bookingAreas: [BookingArea]
        dish(_id: String!): Dishesh
        dishesh: [Dishesh]
        invoice(_id:String): RentingInvoice
        invoices: [RentingInvoice]

      }

      type CalenderEvent {
        _id: String!
        title: String!
        start: String!
        end: String!
        memberId: String!  
        members: Member!
        areaId: String!
        bookingArea: BookingArea!
      }

      type RentingInvoice {
        _id: String!
        memberId: String!
        start: String!
        end: String!
        members: Member
        grandTotal: Int!
        discount: Int!
        invoiceLines: [InvoiceLines]
      }

      input InvoiceLinesInput {
        rentInvoiceId: String
        itemName: String
        price: Int
        quantity: Int
        totalAmount: Int
      }

      type InvoiceLines {
        _id: String!
        rentInvoiceId: String
        itemName: String!
        price: Int!
        quantity: Int!
        totalAmount: Int!
        rentInvoice: RentingInvoice
      }

      type Dishesh {
        _id: String!
        name: String!
        price: String!
        totalQuantity: Int!
      }

      type BookingArea {
        _id: String!
        name: String!
        rent: String !
        calenderEvents: [CalenderEvent]      
      }

      type Member {
        _id: String!
        name: String!
        middleName: String!
        lastName: String!
        phone: String!
        mobile: String!
        calenderEvent: [CalenderEvent]      
      }

      type Post {
        _id: String!
        title: String!
        content: String!
        comments: [Comment]
      }

      type Comment {
        _id: String!
        postId: String!
        content: String!
        post: Post
      }

      type Mutation {
        createPost(title: String!, content: String!): Post
        createComment(postId: String!, content: String!): Comment
        createMember(name: String!, middleName:String!, lastName:String!, phone:String!, mobile:String!): Member
        updateMember(_id:ID!, name: String!, middleName:String!, lastName:String!, phone:String!, mobile:String!): Member
        deleteMember(_id:String!) : Member
        createCalenderEvent(title: String!, start: String!, areaId:String!, end: String!, memberId: String!): CalenderEvent
        updateCalenderEvent(_id:ID!, title: String!, start: String!, areaId:String!, end: String!, memberId: String!): CalenderEvent
        createBookingArea(name: String!, rent:String!): BookingArea
        updateBookingArea(_id: ID!, name: String!, rent:String!): BookingArea
        createDish(name:String!, price: String!, totalQuantity: Int!): Dishesh
        updateDish(_id:ID!, name:String!, price: String!, totalQuantity: Int!): Dishesh
        deleteDish(_id:ID!): Dishesh
        createInvoice( memberId: String!, start: String!, end: String!, grandTotal: Int!, discount: Int!, invoiceLines:[InvoiceLinesInput]): RentingInvoice
        updateInvoice(_id:ID! memberId: String!, start: String!, end: String!, grandTotal: Int!, discount: Int!, invoiceLines:[InvoiceLinesInput]): RentingInvoice
        deleteInvoice(_id:ID!): RentingInvoice
      }

      schema {
        query: Query
        mutation: Mutation
      }
    `]

    const resolvers = {
      Query: {
        post: async (root, { _id }) => {
          return prepare(await Posts.findOne(ObjectId(_id)))
        },
        posts: async () => {
          return (await Posts.find({}).toArray()).map(prepare)
        },
        member: async (root, { _id }) => {
          return prepare(await Member.findOne(ObjectId(_id)))
        },
        members: async () => {
          return (await Member.find({}).toArray()).map(prepare)
        },
        comment: async (root, { _id }) => {
          return prepare(await Comments.findOne(ObjectId(_id)))
        },
        calenderEvent: async (root, { _id }) => {
          return prepare(await CalenderEvent.findOne(ObjectId(_id)))
        },
        calenderEvents: async () => {
          return (await CalenderEvent.find({}).toArray()).map(prepare)
        },
        bookingArea: async (root, { _id }) => {
          return prepare(await BookingArea.findOne(ObjectId(_id)))
        },
        bookingAreas: async () => {
          return (await BookingArea.find({}).toArray()).map(prepare)
        },
        dish: async (root, { _id }) => {
          return prepare(await Dishesh.findOne(ObjectId(_id)))
        },
        dishesh: async () => {
          return (await Dishesh.find({}).toArray()).map(prepare)
        },
        invoices: async () => {
          return (await RentingInvoice.find({}).toArray()).map(prepare)
        },
        invoice: async (root, { _id }) => {
          return prepare(await RentingInvoice.findOne(ObjectId(_id)))
        }
      },
      Post: {
        comments: async ({ _id }) => {
          return (await Comments.find({ postId: _id }).toArray()).map(prepare)
        }
      },
      Comment: {
        post: async ({ postId }) => {
          return prepare(await Posts.findOne(ObjectId(postId)))
        }
      },
      CalenderEvent: {
        members: async ({ memberId }) => {
          return prepare(await Member.findOne(ObjectId(memberId)))
        },
        bookingArea: async ({ areaId }) => {
          return prepare(await BookingArea.findOne(ObjectId(areaId)))
        }
      },
      Member: {
        calenderEvent: async ({ _id }) => {
          return (await CalenderEvent.find({ inv: _id }).toArray()).map(prepare)
        }
      },
      BookingArea: {
        calenderEvents: async ({ _id }) => {
          return (await CalenderEvent.find({ areaId: _id }).toArray()).map(prepare)
        }
      },
      RentingInvoice: {
        members: async ({ memberId }) => {
          return prepare(await Member.findOne({ _id: ObjectId(memberId) }))
        },
        invoiceLines: async ({ _id }) => {
          return (await InvoiceLines.find({ rentInvoiceId: _id }).toArray()).map(prepare)
        }
      },
      Mutation: {
        createPost: async (root, args, context, info) => {
          const res = await Posts.insertOne(args)
          return prepare(res.ops[0]) // https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#~insertOneWriteOpResult
        },
        createComment: async (root, args) => {
          const res = await Comments.insert(args)
          return prepare(await Comments.findOne({ _id: res.insertedIds[1] }))
        },
        createMember: async (root, args) => {
          console.log(args)
          const res = await Member.insertOne(args)
          return prepare(res.ops[0])
        },
        updateMember: async (root, args) => {
          const id = args['_id']
          delete args['_id']
          await Member.updateOne(
            { '_id': ObjectId(id) }, // Filter
            { $set: args }, // Update
            { upsert: true }
          )
          return prepare(await Member.findOne({ _id: ObjectId(id) }))
        },
        deleteMember: async (root, args) => {
          console.log(args)
          const deletedRec = await Member.findOne({ _id: ObjectId(args['_id']) })
          const res = await Member.deleteOne({ _id: ObjectId(args['_id']) })
          console.log(res)
          return prepare(deletedRec)
        },
        createCalenderEvent: async (root, args) => {
          console.log(args)
          const res = await CalenderEvent.insertOne(args)
          return prepare(res.ops[0])
        },
        updateCalenderEvent: async (root, args) => {
          const id = args['_id']
          delete args['_id']
          await CalenderEvent.updateOne(
            { '_id': ObjectId(id) }, // Filter
            { $set: args }, // Update
            { upsert: true }
          )
          return prepare(await CalenderEvent.findOne({ _id: ObjectId(id) }))
        },
        createBookingArea: async (root, args) => {
          const res = await BookingArea.insertOne(args)
          console.log(res)
          res.ops[0].status = 'Record updated successfully'
          return prepare(res.ops[0])
        },
        createDish: async (root, args) => {
          console.log(args)
          const res = await Dishesh.insertOne(args)
          return prepare(res.ops[0])
        },
        updateDish: async (root, args) => {
          const id = args['_id']
          delete args['_id']
          await Dishesh.updateOne(
            { '_id': ObjectId(id) }, // Filter
            { $set: args }, // Update
            { upsert: true }
          )
          return prepare(await Dishesh.findOne({ _id: ObjectId(id) }))
        },
        deleteDish: async (root, args) => {
          const deletedRec = await Dishesh.findOne({ _id: ObjectId(args['_id']) })
          await Dishesh.deleteOne({ _id: ObjectId(args['_id']) })
          return prepare(deletedRec)
        },
        createInvoice: async (root, args) => {
          console.log(args)
          const invoiceLines = JSON.parse(JSON.stringify(args['invoiceLines']))
          console.log(invoiceLines)
          delete args['invoiceLines']
          const res = await RentingInvoice.insertOne(args)
          invoiceLines.forEach(item => {
            item.rentInvoiceId = res.ops[0]._id.toString()
          })
          await InvoiceLines.insertMany(invoiceLines)
          return prepare(res.ops[0])
        },
        updateInvoice: async (root, args) => {
          console.log(args)
          const id = args['_id']
          const invoiceLines = JSON.parse(JSON.stringify(args['invoiceLines']))
          delete args['_id']
          delete args['invoiceLines']
          const res = await RentingInvoice.updateOne(
            { '_id': ObjectId(id) }, // Filter
            { $set: args }, // Update
            { upsert: true }
          )
          // delete existing invoiceLines
          InvoiceLines.deleteMany({ 'rentInvoiceId': id })
          // insert new invoiceLines
          invoiceLines.forEach(item => {
            item.rentInvoiceId = id
          })
          await InvoiceLines.insertMany(invoiceLines)
          return prepare(await RentingInvoice.findOne({ _id: ObjectId(id) }))
        },
        deleteInvoice: async (root, args) => {
          const id = args['_id']
          InvoiceLines.deleteMany({ 'rentInvoiceId': id })
          const deletedRec = await RentingInvoice.findOne({ _id: ObjectId(id) })
          await RentingInvoice.deleteOne({ _id: ObjectId(id) })
          return prepare(deletedRec)
        }
      }
    }

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers
    })

    app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

    app.use(homePath, graphiqlExpress({
      endpointURL: '/graphql'
    }))

    app.post('/createPdf', (req, res) => {
      console.log(req.body)
      const html = req.body
      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) console.log(err)
        res.type('pdf')
        res.end(buffer, 'binary')
      })
      // pdf.create(html, options).toFile('test.pdf', function (err, ret) {
      //   if (err) return console.log(err)
      //   console.log(ret)
      //   res.send(JSON.stringify(ret))
      //   // res.send(res)// { filename: '/app/businesscard.pdf' }
      // })
    })

    app.listen(PORT, () => {
      console.log(`Visit ${URL}:${PORT}${homePath}`)
    })
  } catch (e) {
    console.log(e)
  }
}

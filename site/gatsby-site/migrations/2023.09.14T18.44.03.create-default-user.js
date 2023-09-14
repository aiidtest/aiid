const { ObjectId } = require('bson');

const config = require('../config');

const userId = '65031f49ec066d7c64380f5c';

/**
 *
 * @param {{context: {client: import('mongodb').MongoClient}}} context
 */

exports.up = async ({ context: { client } }) => {
  const first_name = 'Anonymous';

  const last_name = 'User';

  await client.connect();

  const usersCollection = client.db(config.realm.production_db.db_custom_data).collection('users');

  const defaultUser = await usersCollection.findOne({ userId: userId });

  if (defaultUser) {
    // If the default user already exist in the database, we update the first and last name
    const updateResult = await usersCollection.updateOne(
      { _id: defaultUser._id },
      {
        $set: {
          first_name,
          last_name,
        },
      }
    );

    console.log(
      `Update userId: ${defaultUser.userId}, with '${first_name} ${last_name}' name, ${updateResult.modifiedCount}`
    );
  } else {
    // if the default user does not exist in the database, we insert it
    const insertResult = await usersCollection.insertOne({
      _id: new ObjectId(userId),
      userId: userId,
      roles: ['subscriber'],
      first_name,
      last_name,
    });

    console.log(
      `Insert userId: ${userId}, with '${first_name} ${last_name}' name, ${insertResult.insertedId}`
    );
  }
};

/**
 *
 * @param {{context: {client: import('mongodb').MongoClient}}} context
 */
exports.down = async ({ context: { client } }) => {
  await client.connect();

  const usersCollection = client.db(config.realm.production_db.db_custom_data).collection('users');

  const defaultUser = await usersCollection.findOne({ userId: userId });

  if (defaultUser) {
    // Unset the first and last name
    const updateResult = await usersCollection.updateOne(
      { _id: defaultUser._id },
      {
        $unset: {
          first_name: '',
          last_name: '',
        },
      }
    );

    console.log(`Rollback userId: ${defaultUser.userId}, ${updateResult.modifiedCount}`);
  }
};

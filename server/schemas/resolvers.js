const { User, Book } = require('../models');
const { signToken } = require('../utils/auth')

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log(context.user)

      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }

      throw new AuthenticationError('No user found with this email address');
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, args, context) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
      },

    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id, },
          { $push: {savedBooks: args.input, }, },
          { new: true }
        );

        return updatedUser;
      }
      throw new AuthenticationError('No user found with this email address');
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id, },
          { $pull: {savedBooks: args.bookId, }, },
          { new: true }
        );

        return updatedUser;
      }
      throw new AuthenticationError('No user found with this email address');
    },
    
  },
};

module.exports = resolvers;

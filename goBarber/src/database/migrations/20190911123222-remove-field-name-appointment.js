module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('appointments','name')
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.addColumn('appointments', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    })
  }
};

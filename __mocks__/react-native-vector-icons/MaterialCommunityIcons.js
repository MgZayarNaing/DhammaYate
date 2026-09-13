const React = require('react');
const {Text} = require('react-native');

function MockIcon({name, ...props}) {
  return React.createElement(Text, props, name);
}

module.exports = MockIcon;
module.exports.default = MockIcon;

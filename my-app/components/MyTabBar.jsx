import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const icons = {
  home: 'home-outline',
  explore: 'compass-outline',
  add_post: 'add-circle-outline',
  inbox: 'chatbubble-ellipses-outline',
  profile: 'person-outline',
};

const MyTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = icons[route.name] || 'ellipse-outline';  // Fallback

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#06260E' : '#888'}
              style={styles.icon}
            />
            <Text style={[styles.label, isFocused && styles.focusedLabel]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default MyTabBar;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#fff',
    paddingVertical: 8,
    justifyContent: 'space-around',
    elevation: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#888',
  },
  focusedLabel: {
    color: '#06260E',
    fontWeight: '600',
  },
});

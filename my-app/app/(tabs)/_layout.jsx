import { StyleSheet, View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import MyTabBar from '../../components/MyTabBar';
import { StatusBar } from 'expo-status-bar';



const TabsLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="add_post"
        options={{ 
          title: 'Post', 
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Inbox",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  )
}

export default TabsLayout;

const styles = StyleSheet.create({});

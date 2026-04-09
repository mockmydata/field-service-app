import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Home from './screens/Home';
import JobDetails from './screens/Jobs/JobDetails';
import CustomersScreen from './screens/Customers/CustomersScreen';
import CustomerDetail from './screens/Customers/CustomerDetails';
import Staff from './screens/Staff/Staffscreen';
import AddStaffScreen    from './screens/Staff/AddStaffScreen';
import EditStaffScreen   from './screens/Staff/EditStaffScreen';
import LoginScreen from './screens/LoginScreen';
import StaffDetailScreen from './screens/Staff/StaffDetail';
import AddCustomerScreen from './screens/Customers/AddCustomerScreen';
import EditCustomerScreen from './screens/Customers/EditCustomerScreen';
import AddJobScreen from './screens/Jobs/AddJobScreen';
import ProfileScreen from './screens/Settings/Profile';
import SignupScreen from './screens/Auth/SignupScreen';

const HomeTabs = createBottomTabNavigator({
  screens: {
    Home: {
      screen: Home,
      options: {
        title: 'Jobs',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="briefcase-outline" size={size} color={color} />
        ),
      },
    },
    Customers: {
      screen: CustomersScreen,
      options: {
        title: 'Customers',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account-group-outline" size={size} color={color} />
        ),
      },
    },
    Staff: {
      screen: Staff,
      options: {
        title: 'Staff',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="hard-hat" size={size} color={color} />
        ),
      },
    },
  },
});
 
const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: '#F4F6FA' },
    animation: 'fade',
  },
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        animation: 'fade',
      },
    },
    JobDetail: {
      screen: JobDetails,
    },
    CustomerDetail: {
      screen: CustomerDetail,
    },
    StaffDetail: {
      screen: StaffDetailScreen,
    },
    AddStaff: {
      screen: AddStaffScreen,
    },
    EditStaff: {
      screen: EditStaffScreen,
    },
    AddCustomer: {
      screen: AddCustomerScreen,
    },
    EditCustomer: {
      screen: EditCustomerScreen,
    },
    AddJob: {
      screen: AddJobScreen,
    },
    Profile: {
      screen: ProfileScreen,
    },
  },
});

const AuthStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
    contentStyle: { backgroundColor: '#2D73DE' },
  },
  screens: {
    Login: {
      screen: LoginScreen,
    },
  
    Signup: {
      screen: SignupScreen,
    },
  },
});

export const AuthNavigation = createStaticNavigation(AuthStack);
type AuthStackParamList = StaticParamList<typeof AuthStack>;

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
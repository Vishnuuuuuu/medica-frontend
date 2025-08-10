import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const GOOGLE_AUTH = gql`
  mutation GoogleAuth($input: GoogleAuthInput!) {
    googleAuth(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
    }
  }
`;

export const CLOCK_IN = gql`
  mutation ClockIn($input: ClockInInput!) {
    clockIn(input: $input) {
      id
      clockInAt
      clockInNote
      clockInLat
      clockInLng
      user {
        id
        name
      }
    }
  }
`;

export const CLOCK_OUT = gql`
  mutation ClockOut($input: ClockOutInput!) {
    clockOut(input: $input) {
      id
      clockOutAt
      clockOutNote
      clockOutLat
      clockOutLng
      user {
        id
        name
      }
    }
  }
`;

export const GET_SHIFTS = gql`
  query GetShifts {
    shifts {
      id
      clockInAt
      clockOutAt
      clockInNote
      clockOutNote
      clockInLat
      clockInLng
      clockOutLat
      clockOutLng
      user {
        id
        name
      }
    }
  }
`;

export const GET_STAFF_CLOCKED_IN = gql`
  query GetStaffClockedIn {
    staffClockedIn {
      id
      name
      email
    }
  }
`;

export const GET_STAFF_SHIFT_LOGS = gql`
  query GetStaffShiftLogs {
    staffShiftLogs {
      id
      clockInAt
      clockOutAt
      clockInNote
      clockOutNote
      user {
        id
        name
        email
      }
    }
  }
`;

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      userId
      userName
      avgHoursPerDay
      clockInsToday
      totalHoursThisWeek
    }
  }
`;

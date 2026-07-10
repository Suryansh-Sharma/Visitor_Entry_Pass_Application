import { gql } from "@apollo/client";

export const GET_VISITOR_BY_CONTACT = gql`
  query GetVisitorByContact($visitorContact: String!) {
    getVisitorByContact(visitorContact: $visitorContact) {
      id
      visitorContact
      visitorName
      visitorImage
      banStatus {
        isVisitorBanned
        bannedOn
        reason
      }
      visitorAddress {
        city
        line1
        pinCode
      }
      hasChildrenInSchool
      lastVisitedOn
      visitorChildren {
        name
        standard
      }
    }
  }
`;

export const GET_VISITOR_BY_ID = gql`
  query GetVisitorById($visitorId: String!) {
    getVisitorById(visitorId: $visitorId) {
      id
      visitorContact
      visitorName
      visitorImage
      banStatus {
        isVisitorBanned
        bannedOn
        reason
      }
      visitorAddress {
        city
        line1
        pinCode
      }
      hasChildrenInSchool
      lastVisitedOn
      visitorChildren {
        name
        standard
      }
    }
  }
`;

export const ADD_NEW_VISIT = gql`
  mutation AddNewVisit($input: AddNewVisitModel!) {
    addNewVisit(input: $input)
  }
`;

export const Add_New_TelegramId = gql`
  mutation AddNewTelegramId($input: TelegramIdModel!) {
    addNewTelegramId(input: $input)
  }
`;

export const Delete_TelegramId = gql`
  mutation DeleteTelegramId($id: String!) {
    deleteTelegramId(id: $id)
  }
`;

export const Registor_New_User = gql`
  mutation RegistorNewUser($input: UserInput!) {
    registerNewUser(input: $input) {
      id
      username
      contact
      role
      isActive
      isVerified
    }
  }
`;

export const UPDATE_VISITOR = gql`
  mutation UpdateVisitorInfo($input: VisitorInput!) {
    updateVisitorInfo(input: $input) {
      id
      visitorContact
      visitorName
      visitorImage
      banStatus {
        isVisitorBanned
        bannedOn
        reason
      }
      visitorAddress {
        city
        line1
        pinCode
      }
      hasChildrenInSchool
      lastVisitedOn
      visitorChildren {
        name
        standard
      }
    }
  }
`;

export const SEARCH_VISITOR = gql`
  query SearchVisitor(
    $filter: VisitorFilterInput!
    $pagination: PaginationInput!
  ) {
    searchVisitor(filter: $filter, pagination: $pagination) {
      pageNo
      pageSize
      totalPages
      totalData
      data {
        id
        visitorContact
        visitorName
        visitorImage
        hasChildrenInSchool
        lastVisitedOn
        banStatus {
          bannedOn
          isVisitorBanned
          reason
        }
        visitorAddress {
          line1
          city
          state
          country
          pinCode
        }
        visitorChildren {
          name
          standard
        }
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      id
      username
      contact
      isActive
      role
      isVerified
      credentials {
        jwtToken {
          token
          validity
        }
        refreshToken {
          token
          generatedOn
          expiresOn
        }
      }
    }
  }
`;

export const GET_ALL_TELEGRAM_IDS = gql`
  query getAllTelegramIds {
    getAllTelegramIds {
      id
      hostName
      chatId
      role
      dateOfJoin
    }
  }
`;

export const REGEN_JWT_TOKEN = gql`
  mutation RegenerateJwtFromRefreshToken($refreshToken: String!) {
    regenJwtFromRefreshToken(refreshToken: $refreshToken) {
      jwtToken {
        token
        validity
      }
      refreshToken {
        token
        generatedOn
        expiresOn
      }
    }
  }
`;

export const LOGOUT_USER = gql`
  mutation handleLogout($authorization: String!, $refreshToken: String!) {
    handleLogout(authorization: $authorization, refreshToken: $refreshToken)
  }
`;

export const SEARCH_VISITS = gql`
  query SearchVisits($filter: VisitFilterInput, $pagination: PaginationInput) {
    visits(filter: $filter, pagination: $pagination) {
      pageNo
      pageSize
      totalData
      totalPages
      data {
        id
        visitedOn
        reason
        visitorHost
        status
        note
        visitorInfo {
          id
          visitorContact
          visitorName
          visitorImage
        }
      }
    }
  }
`;

export const SEARCH_VISITS_OF_VISITOR = gql`
  query SearchVisitsOfVisitor(
    $filter: VisitFilterInput
    $pagination: PaginationInput
  ) {
    visits(filter: $filter, pagination: $pagination) {
      pageNo
      pageSize
      totalData
      totalPages
      data {
        id
        visitedOn
        reason
        visitorHost
        status
        note
      }
    }
  }
`;

export const GET_ORGANIZATION = gql`
  query getOrganization {
    getOrganization {
      id
      organizationName
      organizationType
      organizationAddress
      organizationPhone
      organizationEmail
      logoPath
    }
  }
`;

export const UPDATE_ORGANIZATION = gql`
  mutation UpdateOrganization($input: OrganizationInput!) {
    updateOrganization(input: $input) {
      id
      organizationName
      organizationType
      organizationAddress
      organizationPhone
      organizationEmail
      logoPath
    }
  }
`;

export const GET_ALL_USERS = gql`
  query getAllUsers {
    getAllUsers {
      id
      username
      contact
      role
      isActive
      isVerified
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      username
      contact
      role
      isActive
      isVerified
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: String!, $role: Role!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const SET_USER_ACTIVE = gql`
  mutation SetUserActive($userId: String!, $isActive: Boolean!) {
    setUserActive(userId: $userId, isActive: $isActive) {
      id
      isActive
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId)
  }
`;

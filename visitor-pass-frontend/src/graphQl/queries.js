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

export const GET_TODAY_ALL_VISIT = gql`
  query GetTodayAllVisit($pageSize: Int, $pageNumber: Int) {
    getTodayAllVisit(pageSize: $pageSize, pageNumber: $pageNumber) {
      totalPages
      pageNo
      visits {
        visitorName
        visitorContact
        visitorImage
        location
        reason
        latestVisitDate
        latestVisitTime
      }
      pageSize
      totalData
    }
  }
`;

export const GET_VISITS_OF_VISITOR = gql`
  query VisitOfVisitor(
    $id: String!
    $page_size: Int
    $page_number: Int
    $sort_by: String
    $sort_order: SortDirection
  ) {
    getVisitOfVisitor(
      id: $id
      page_size: $page_size
      page_number: $page_number
      sort_by: $sort_by
      sort_order: $sort_order
    ) {
      pageNo
      pageSize
      data {
        visitedOn
        reason
        status
        visitorHost
      }
      totalPages
      totalData
    }
  }
`;

export const ADD_NEW_VISIT = gql`
  mutation AddNewVisit($input: VisitInput!) {
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

export const Vetify_Otp = gql`
  mutation VerifyOtp($Otp: Int!, $userId: String!) {
    verifyOtpForUser(Otp: $Otp, userId: $userId)
  }
`;

export const Resend_Otp = gql`
  mutation ResendOtp($userId: String!) {
    regenerateOtpForUser(userId: $userId)
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

export const GET_VISITOR_POFILE_BY_CONTACT = gql`
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

export const SEARCH_VISITOR = gql`
  query SearchVisitor(
    $filters: [SearchFilter]!
    $pageSize: Int
    $pageNumber: Int
    $sort_by: String
    $sort_order: SortDirection
  ) {
    searchVisitor(
      filters: $filters
      pageSize: $pageSize
      pageNumber: $pageNumber
      sort_by: $sort_by
      sort_order: $sort_order
    ) {
      pageNo
      pageSize
      data {
        id
        visitorContact
        visitorName
        banStatus {
          bannedOn
          isVisitorBanned
          reason
        }
        visitorAddress {
          city
          line1
        }
        visitorImage
        visitorChildren {
          name
          standard
        }
      }
      totalPages
      totalData
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

export const GET_VISIT_ON_SPECIFIC_DATE = gql`
  query GetVisitorOnSpecificDate(
    $date: String!
    $sortBy: String
    $pageSize: Int
    $pageNumber: Int
    $sortOrder: SortDirection
  ) {
    getVisitorOnSpecificDate(
      date: $date
      page_size: $pageSize
      page_number: $pageNumber
      sort_by: $sortBy
      sort_order: $sortOrder
    ) {
      pageNo
      pageSize
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
          visitorImage
          visitorName
        }
      }
      totalData
      totalPages
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

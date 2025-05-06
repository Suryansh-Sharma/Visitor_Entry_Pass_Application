import React, { useEffect, useState } from 'react'
import { GET_VISITOR_BY_CONTACT , GET_TODAY_ALL_VISIT} from "../graphQl/queries"
import { useApolloClient, useQuery } from '@apollo/client';
import LoadingPage from "../components/LoadingPage"
function Test() {

    const client = useApolloClient();
        useEffect(() => {
            client
            .query({
                query:GET_TODAY_ALL_VISIT,
                variables:{
                    pageSize:5,
                    pageNumber:0
                } 
            })
            .then(response=>{
                console.log(response.data.getTodayAllVisit);
            })
            .catch(e=>{
                console.log(e);
            })

        }, [])
    return (
        <div>Test</div>
    )
}

export default Test
import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

const PETS_FIELDS =gql `
fragment PetsFields on Pet{
  id
  name
  type
  img
  vaccinated @client
  owner {
      id
      age @client
  }
}`

const ALL_PETS = gql`
  query AllPets{
    pets {
         ...PetsFields
    }
  }
  ${PETS_FIELDS}   
`
const NEW_PET = gql`
mutation CreateAPet($newPet:NewPetInput!) {
  addPet(input:$newPet){
    ...PetsFields
  }
}
${PETS_FIELDS}
`

export default function Pets () {
  const [modal, setModal] = useState(false)
  const {data, loading, error} = useQuery(ALL_PETS)
//in useMutation we  have second argument which will take function which will run after the perfoming mutation and gives you complete control over the cache
  const [createPet , newPet] = useMutation(NEW_PET,{
    update(cache,{data:{addPet}}){
      const data = cache.readQuery({query:ALL_PETS})
      cache.writeQuery({
        query:ALL_PETS,
        data: {pets:[addPet,...data.pets]}
      })
    },
    
  })
  
  const onSubmit = input => {
    setModal(false)
    createPet({
     variables:{newPet:input},
     optimisticResponce:{
       __typename:'Mutation',
       addPet:{
         __typename:"Pet",
         id:Math.floor(Math.random()*10000)+'',
         name:input.name,
         type:input.type,
         img:'https://via.placeholder.com/300',
         vaccinated:true,
         owner:{
           id:Math.floor(Math.random()*10000+1111)+'',
           age:25
         }
       }
     }
    })
  }
  if(loading){
    return <Loader/>
  }
  if(error || newPet.error){
    return <p>error!</p>
  }
  console.log(data.pets[0])
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }
  
  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets}/>
      </section>
    </div>
  )
}

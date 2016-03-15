using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;

using Client.Data;
using Client.Web.Models.Requests.ClientObservations;
using Client.Web.Domain.ClientObservation;

namespace Client.Web.Services
{
    public class ClientObservationService : BaseService, IClientObservationsService
    {
        public int InsertQuestionnaire(COQuestionnaireAddRequest model, string userId, int accountId)
        {
            int id = 0;

            DataProvider.ExecuteNonQuery(GetConnection, "dbo.COQuestionnaires_Insert"
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@Name", model.Name);

                       paramCollection.AddWithValue("@UserId", userId);
                       paramCollection.AddWithValue("@AccountId", accountId);

                       SqlParameter p = new SqlParameter("@Id", System.Data.SqlDbType.Int);
                       p.Direction = System.Data.ParameterDirection.Output;

                       paramCollection.Add(p);

                   }, returnParameters: delegate (SqlParameterCollection param)
                   {
                       int.TryParse(param["@Id"].Value.ToString(), out id);
                   }
                   );

            return id;
        }

        public List<COQuestionnaire> GetQuestionnairesByAccount(int accountId)
        {
            List<COQuestionnaire> list = null;

            DataProvider.ExecuteCmd(GetConnection, "dbo.COQuestionnaires_SelectByAccount"
               , inputParamMapper: delegate (SqlParameterCollection paramCollection)
               {
                   paramCollection.AddWithValue("@AccountId", accountId);

               }, map: delegate (IDataReader reader, short set)
               {
                   COQuestionnaire questionnaire = MapQuestionnaire(reader);

                   if (list == null)
                   {
                       list = new List<COQuestionnaire>();
                   }
                   list.Add(questionnaire);
               }
               );

            return list;
        }

        public void UpdateQuestionnaire(COQuestionnaireUpdateRequest model, int accountId)
        {
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.COQuestionnaires_Update"
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@Name", model.Name);
                       paramCollection.AddWithValue("@Id", model.Id);

                       paramCollection.AddWithValue("@AccountId", accountId);

                   }, returnParameters: delegate (SqlParameterCollection param)
                   {
                   }
                   );
        }

        public void DisableQuestionnaire(int id, int accountId)
        {
            DataProvider.ExecuteNonQuery(GetConnection, "dbo.COQuestionnaires_Disable"
                   , inputParamMapper: delegate (SqlParameterCollection paramCollection)
                   {
                       paramCollection.AddWithValue("@Id", id);
                       paramCollection.AddWithValue("@AccountId", accountId);

                   }, returnParameters: delegate (SqlParameterCollection param)
                   {
                   }
                   );
        }


        //---------------------------------------

        private COQuestionnaire MapQuestionnaire(IDataReader reader)
        {
            COQuestionnaire cq = new COQuestionnaire();
            int startingIndex = 0;

            cq.Id = reader.GetSafeInt32(startingIndex++);
            cq.Name = reader.GetSafeString(startingIndex++);
            cq.DateAdded = reader.GetSafeUtcDateTime(startingIndex++);
            cq.DateModified = reader.GetSafeUtcDateTime(startingIndex++);

            return cq;
        }
    }
}
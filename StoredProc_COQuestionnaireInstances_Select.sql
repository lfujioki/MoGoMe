USE [C14]
GO
/****** Object:  StoredProcedure [dbo].[COQuestionnaireInstances_Select]   ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[COQuestionnaireInstances_Select]
			 @AccountId int
			,@ClientId nvarchar(128)
/*
	DECLARE  	 @AccountId int = 2
			,@ClientId nvarchar(128) = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'

	EXECUTE [dbo].[COQuestionnaireInstances_Select] 
			 @AccountId
			,@ClientId

	SELECT * FROM [dbo].[COQuestionnaireInstances]
*/
AS
BEGIN 

	SELECT	 	 q.[Id]
			,q.[Name]
			,i.[Id] AS InstanceId
			,i.[DateAdded]
			,i.[DateModified]
			
	FROM [dbo].[COQuestionnaires] AS q WITH (NOLOCK) LEFT OUTER JOIN [dbo].[COQuestionnaireInstances] AS i WITH (NOLOCK)
			ON q.[Id] = i.[COQuestionnaireId]

	WHERE   	i.[AccountId] = @AccountId AND 
			i.[ClientId] = @ClientId AND 
			i.[IsActive] = 1

	ORDER BY i.[DateModified] DESC;

END
(function () {
    'use strict';

    angular.module(APPNAME)
        .controller('questionnairesController', QuestionnairesController);

    QuestionnairesController.$inject = [
          '$scope'
        , '$baseController'
        , '$observationService'
        , '$uibModal'
        , '$log'
    ];

    function QuestionnairesController(
          $scope
        , $baseController
        , $observationService
        , $uibModal
        , $log
        ) {

        var vm = this;
        $baseController.merge(vm, $baseController);
        vm.$scope = $scope;
        vm.$observationService = $observationService;
        vm.notify = vm.$observationService.getNotifier($scope);

        // Questionnaire properties
        vm.questionnaireItem = null;
        vm.questionnaireItems = null;
        vm.selectedQuestionnaire = null;
        vm.newQuestionnaire = null;
        vm.isQuestionnaireForm = false;
        vm.isQuestionnaireErrors = false;
        vm.questionnaireRequest = {};
        vm.isQuestionnairesData = false;

        // CRUD
        vm.addQuestionnaire = _addQuestionnaire;
        vm.updateQuestionnaire = _updateQuestionnaire;
        vm.deleteQuestionnaire = _deleteQuestionnaire;

        // Ajax Success / Error
        vm.onQuestionnairesGetSuccess = _onQuestionnairesGetSuccess;
        vm.onQuestionnairesGetError = _onQuestionnairesGetError;
        vm.onQuestionnaireAddSuccess = _onQuestionnaireAddSuccess;
        vm.onQuestionnaireAddError = _onQuestionnaireAddError;
        vm.onQuestionnaireUpdateSuccess = _onQuestionnaireUpdateSuccess;
        vm.onQuestionnaireUpdateError = _onQuestionnaireUpdateError;
        vm.onQuestionnaireDeleteSuccess = _onQuestionnaireDeleteSuccess;
        vm.onQuestionnaireDeleteError = _onQuestionnaireDeleteError;

        // Helpers
        vm.onFireTabChangedEvent = _onFireTabChangedEvent;
        vm.modalQuestionnaireOpen = _modalQuestionnaireOpen;


        render();

        function render() {
            vm.setUpCurrentRequest(vm);
            wireUpListeners();

            vm.onFireTabChangedEvent(0);

            vm.$observationService.questionnaires.getById(vm.onQuestionnairesGetSuccess, vm.onQuestionnairesGetError);
        }

        function wireUpListeners() {
            vm.$systemEventService.listen('addObservationsDataRequest', onReceiveAddDataRequestEvent, vm);
        }

        function onReceiveAddDataRequestEvent(event, payload) {
            vm.modalQuestionnaireOpen();
        }

        function _modalQuestionnaireOpen() {
            var modalInstance = $uibModal.open({
                templateUrl: '/Scripts/core/clientObservations/views/CONewQuestionnaireInput.html',
                controller: 'questionnaireInputCtrl',
                controllerAs: 'modal',
                resolve: {
                    item: function () {
                        vm.newQuestionnaire = null;
                        return vm.newQuestionnaire;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                vm.questionnaireRequest.name = selectedItem;
                vm.addQuestionnaire(vm.questionnaireRequest);

            }, function () {
                vm.$alertService.warning('The Questionnaire form has not been saved.');
            });
        };

        function _onQuestionnairesGetSuccess(data) {
            vm.notify(function () {
                if (data && data.items) {
                    vm.questionnaireItems = data.items;
                    vm.isQuestionnairesData = true;
                }
                else {
                    vm.$alertService.info('There are no Questionnaires for this client.');
                    vm.isQuestionnairesData = false;
                }
            });
        }

        function _onQuestionnairesGetError(jqXhr, error) {
            vm.$alertService.error('There was a problem retrieving the Questionnaires.');
        }

        function _addQuestionnaire(eventData) {
            if (eventData) {
                vm.newQuestionnaire = eventData;
                vm.$observationService.questionnaires.add(vm.newQuestionnaire, vm.onQuestionnaireAddSuccess, vm.isNewQuestionnaireErrors);
            }
            else {
                vm.$alertService.error('Form submitted with invalid data');
            }
        }

        function _onQuestionnaireAddSuccess(data) {
            vm.notify(function () {
                if (data && data.item) {
                    vm.newQuestionnaire.id = data.item;

                    if (!vm.questionnaireItems) {
                        vm.questionnaireItems = [];
                    }

                    var today = new Date();
                    var responseDate = moment.utc(today).toDate();
                    vm.newQuestionnaire.dateModified = responseDate;

                    vm.questionnaireItems.unshift(vm.newQuestionnaire);

                    vm.$alertService.success('The Questionnaire "' + vm.newQuestionnaire.name + '" has been successfully added.');
                    vm.newQuestionnaire = {};
                    vm.isQuestionnairesData = true;
                }
            });
        }

        function _onQuestionnaireAddError(jqXhr, error) {
            vm.$alertService.error('There was a problem adding the Questionnaire. Please try again.');
        }

        function _updateQuestionnaire(aQuestionnaire) {
            vm.isQuestionnaireErrors = true;

            if (aQuestionnaire) {
                vm.$observationService.questionnaires.update(aQuestionnaire.id, aQuestionnaire.name,  aQuestionnaire, vm.onQuestionnaireUpdateSuccess, vm.onQuestionnaireUpdateError);
            }
            else {
                vm.$alertService.error('Form submitted with invalid data');
            }
        }

        function _onQuestionnaireUpdateSuccess(data, qName) {
            vm.notify(function () {
                if (data) {
                    vm.$alertService.success('The Questionnaire "' + qName + '" has been successfully updated.');
                }
            });
        }

        function _onQuestionnaireUpdateError(jqXhr, error) {
            vm.$alertService.error('There was a problem updating the Questionnaire. Please try again.');
        }

        function _deleteQuestionnaire(aQuestionnaire) {
            vm.$observationService.questionnaires.disable(aQuestionnaire.id, aQuestionnaire.name, vm.onQuestionnaireDeleteSuccess, vm.onQuestionnaireDeleteError);
        }

        function _onQuestionnaireDeleteSuccess(data, qId, qName) {
            vm.notify(function () {
                if (data) {
                    vm.$alertService.success('The Questionnaire "' + qName + '" has been successfully deleted.');

                    var templist = vm.questionnaireItems;

                    for (var i = 0; i < templist.length; i++) {
                        if (templist[i].id == qId) {
                            templist.splice(i, 1);
                        }
                    }

                    if (typeof templist === 'undefined' || templist.length < 1) {
                        vm.$alertService.info('There are no Questionnaires for this client.');
                        vm.isQuestionnairesData = false;
                    }
                }
            });
        }

        function _onQuestionnaireDeleteError(jqXhr, error) {
            vm.$alertService.error('There was a problem deleting the Questionnaire. Please try again.');
        }

        function _onFireTabChangedEvent(idx, q) {
            var broadcastData = {
                tabIndex: idx
                , title: 'Questionnaires'
            }
            vm.$systemEventService.broadcast('tabChanged', broadcastData);
            vm.$systemEventService.broadcast("titleChanged", broadcastData);
        }

    }
})();
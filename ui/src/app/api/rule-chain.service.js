/*
 * Copyright © 2016-2018 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export default angular.module('thingsboard.api.ruleChain', [])
    .factory('ruleChainService', RuleChainService).name;

/*@ngInject*/
function RuleChainService($http, $q, $filter, $ocLazyLoad, $translate, types, componentDescriptorService) {

    var ruleNodeComponents = null;

    var service = {
        getSystemRuleChains: getSystemRuleChains,
        getTenantRuleChains: getTenantRuleChains,
        getRuleChains: getRuleChains,
        getRuleChain: getRuleChain,
        saveRuleChain: saveRuleChain,
        deleteRuleChain: deleteRuleChain,
        getRuleChainMetaData: getRuleChainMetaData,
        saveRuleChainMetaData: saveRuleChainMetaData,
        getRuleNodeComponents: getRuleNodeComponents,
        getRuleNodeComponentByClazz: getRuleNodeComponentByClazz,
        getRuleNodeSupportedLinks: getRuleNodeSupportedLinks,
        resolveTargetRuleChains: resolveTargetRuleChains
    };

    return service;

    function getSystemRuleChains (pageLink, config) {
        var deferred = $q.defer();
        var url = '/api/system/ruleChains?limit=' + pageLink.limit;
        if (angular.isDefined(pageLink.textSearch)) {
            url += '&textSearch=' + pageLink.textSearch;
        }
        if (angular.isDefined(pageLink.idOffset)) {
            url += '&idOffset=' + pageLink.idOffset;
        }
        if (angular.isDefined(pageLink.textOffset)) {
            url += '&textOffset=' + pageLink.textOffset;
        }
        $http.get(url, config).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function getTenantRuleChains (pageLink, config) {
        var deferred = $q.defer();
        var url = '/api/tenant/ruleChains?limit=' + pageLink.limit;
        if (angular.isDefined(pageLink.textSearch)) {
            url += '&textSearch=' + pageLink.textSearch;
        }
        if (angular.isDefined(pageLink.idOffset)) {
            url += '&idOffset=' + pageLink.idOffset;
        }
        if (angular.isDefined(pageLink.textOffset)) {
            url += '&textOffset=' + pageLink.textOffset;
        }
        $http.get(url, config).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function getRuleChains (pageLink, config) {
        var deferred = $q.defer();
        var url = '/api/ruleChains?limit=' + pageLink.limit;
        if (angular.isDefined(pageLink.textSearch)) {
            url += '&textSearch=' + pageLink.textSearch;
        }
        if (angular.isDefined(pageLink.idOffset)) {
            url += '&idOffset=' + pageLink.idOffset;
        }
        if (angular.isDefined(pageLink.textOffset)) {
            url += '&textOffset=' + pageLink.textOffset;
        }
        $http.get(url, config).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function getRuleChain(ruleChainId, config) {
        var deferred = $q.defer();
        var url = '/api/ruleChain/' + ruleChainId;
        $http.get(url, config).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function saveRuleChain(ruleChain) {
        var deferred = $q.defer();
        var url = '/api/ruleChain';
        $http.post(url, ruleChain).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function deleteRuleChain(ruleChainId) {
        var deferred = $q.defer();
        var url = '/api/ruleChain/' + ruleChainId;
        $http.delete(url).then(function success() {
            deferred.resolve();
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function getRuleChainMetaData(ruleChainId, config) {
        var deferred = $q.defer();
        var url = '/api/ruleChain/' + ruleChainId + '/metadata';
        $http.get(url, config).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function saveRuleChainMetaData(ruleChainMetaData) {
        var deferred = $q.defer();
        var url = '/api/ruleChain/metadata';
        $http.post(url, ruleChainMetaData).then(function success(response) {
            deferred.resolve(response.data);
        }, function fail() {
            deferred.reject();
        });
        return deferred.promise;
    }

    function getRuleNodeSupportedLinks(component) {
        var relationTypes = component.configurationDescriptor.nodeDefinition.relationTypes;
        var customRelations = component.configurationDescriptor.nodeDefinition.customRelations;
        var linkLabels = [];
        for (var i=0;i<relationTypes.length;i++) {
            linkLabels.push({
                name: relationTypes[i], custom: false
            });
        }
        if (customRelations) {
            linkLabels.push(
                { name: 'Custom', custom: true }
            );
        }
        return linkLabels;
    }

    function getRuleNodeComponents() {
        var deferred = $q.defer();
        if (ruleNodeComponents) {
            deferred.resolve(ruleNodeComponents);
        } else {
            loadRuleNodeComponents().then(
                (components) => {
                    resolveRuleNodeComponentsUiResources(components).then(
                        (components) => {
                            ruleNodeComponents = components;
                            ruleNodeComponents.push(
                                types.ruleChainNodeComponent
                            );
                            deferred.resolve(ruleNodeComponents);
                        },
                        () => {
                            deferred.reject();
                        }
                    );
                },
                () => {
                    deferred.reject();
                }
            );
        }
        return deferred.promise;
    }

    function resolveRuleNodeComponentsUiResources(components) {
        var deferred = $q.defer();
        var tasks = [];
        for (var i=0;i<components.length;i++) {
            var component = components[i];
            tasks.push(resolveRuleNodeComponentUiResources(component));
        }
        $q.all(tasks).then(
            (components) => {
                deferred.resolve(components);
            },
            () => {
                deferred.resolve(components);
            }
        );
        return deferred.promise;
    }

    function resolveRuleNodeComponentUiResources(component) {
        var deferred = $q.defer();
        var uiResources = component.configurationDescriptor.nodeDefinition.uiResources;
        if (uiResources && uiResources.length) {
            var tasks = [];
            for (var i=0;i<uiResources.length;i++) {
                var uiResource = uiResources[i];
                tasks.push($ocLazyLoad.load(uiResource));
            }
            $q.all(tasks).then(
                () => {
                    deferred.resolve(component);
                },
                () => {
                    component.configurationDescriptor.nodeDefinition.uiResourceLoadError = $translate.instant('rulenode.ui-resources-load-error');
                    deferred.resolve(component);
                }
            )
        } else {
            deferred.resolve(component);
        }
        return deferred.promise;
    }

    function getRuleNodeComponentByClazz(clazz) {
        var res = $filter('filter')(ruleNodeComponents, {clazz: clazz}, true);
        if (res && res.length) {
            return res[0];
        }
        return null;
    }

    function resolveTargetRuleChains(ruleChainConnections) {
        var deferred = $q.defer();
        if (ruleChainConnections && ruleChainConnections.length) {
            var tasks = [];
            for (var i = 0; i < ruleChainConnections.length; i++) {
                tasks.push(getRuleChain(ruleChainConnections[i].targetRuleChainId.id));
            }
            $q.all(tasks).then(
                (ruleChains) => {
                    var ruleChainsMap = {};
                    for (var i = 0; i < ruleChains.length; i++) {
                        ruleChainsMap[ruleChains[i].id.id] = ruleChains[i];
                    }
                    deferred.resolve(ruleChainsMap);
                },
                () => {
                    deferred.reject();
                }
            );
        } else {
            deferred.resolve({});
        }
        return deferred.promise;
    }

    function loadRuleNodeComponents() {
        return componentDescriptorService.getComponentDescriptorsByTypes(types.ruleNodeTypeComponentTypes);
    }


}

/*
 * Copyright (C) 2017 IgorStrykhar  in  SMI2
 * All rights reserved.
 * GPLv3
 */

((angular, smi2) => {
    'use strict';

    angular.module(smi2.app.name).directive('drawWidget', ['$compile','$timeout', function ($compile,$timeout) {
        return {
            restrict: 'EA',
            template: '<div style="width: 100%;height: 100%"></div>',
            scope: {
                widget: '=widget',
                isdark: '=isdark'
            },
            replace:true,
            link: buildLinkFunc($compile,$timeout)
        };
    }]);


    function buildDrawChart(widget,element,$timeout) {
        let html='';

        if (widget.draw.library=='echarts') {
            let theme='macarons';
            if (widget.isDark) theme='dark';

            // результат работы сам компонент, а не HTML код
            widget.draw.chart = echarts.init(element[0], theme);
            html=false;
        }


        if (widget.draw.library=='c3') {
            console.info('DW:c3');
        }

        if (widget.draw.library=='d3') {
            console.info('DW:d3');
        }

        if (widget.draw.library=='amchart') {
            html = `<am-chart options="widget.draw.options" height="100%"  width="100%"></am-chart>`;

        }
        // ------------------------------------------------------------------------------------------------------------------
        // Запускаем пре процессоры, преобразуют данные для виджета
        if (widget.preProcessor instanceof Function) {
            widget.preProcessor();
        }

        if (widget.draw.preProcessor instanceof Function) {
            widget.draw.preProcessor();
        }

        return html;
    }




    function buildLinkFunc($compile,$timeout) {

        return function (scope, element, attrs) {

            // задаем виджету стиль темный / светлый
            scope.widget.isDark=scope.isdark;
            // -------------------------------- Text & Error RENDER ----------------------------------------------
            // Если widget содержит ошибку или в поле textformat не false => результат это текс, отрисует сам WidgetsList.html
            if (scope.widget.error || scope.widget.textformat)
            {
                return ;
            }

            // ------------------------------------ TABLE ---------------------------------------------------------
            // TABLE RENDER
            if (scope.widget.type=='table' && !scope.widget.error)
            {
                scope.widget.element = angular.element(`<hot-table
                        settings="widget.table.settings"
                        datarows="widget.data.data"
                        ng-class="{'handsontable-dark': widget.isDark}"
                        width="widget.table.width"
                        col-headers="widget.table.colHeaders"
                        manual-column-resize="true"
                    ></hot-table>`);
            }
            // ------------------------------------- DRAW --------------------------------------------------------
            //
            // Если тип виджета DRAW ( график ) получаем html, котороый рисует другую дерективу
            // Или можем получить уже готовый scope.widget.element, тогда в HTML будет FALSE
            if (scope.widget.type=='draw' && !scope.widget.error )
            {
                scope.widget.element = false;
                let html=buildDrawChart(scope.widget,element,$timeout);
                if (html)
                {
                    scope.widget.element = angular.element(html);
                }
            }
            // --------------------------------------- PIVOT ------------------------------------------------------
            //
            // Если нужно отрисовать PivotJS
            if (scope.widget.type=='pivot' && !scope.widget.error)
            {
                scope.widget.element = angular.element(`<div><pivot data="widget.data.data" config="widget.pivot.config" edit-mode="true"></pivot></div>`);
            }

            // Отрисуем элемент
            if (scope.widget.element)
            {
                element.append(scope.widget.element);
                $compile(scope.widget.element)(scope);
            }

            // после того как виджет подготовлен и отрисован, запланируем widget ресайз
            scope.widget.scheduledResize();


            // подписываемся на изменение размера, и запланируем widget ресайз
            scope.$watch('widget.sizeY', function(){
                // изменился размер
                scope.widget.scheduledResize();
            }, true);
            scope.$watch('widget.sizeX', function(){
                // изменился размер
                scope.widget.scheduledResize();
            }, true);



            // Доп ресайзеры

            // We want to manually handle `window.resize` event in each directive.
            // So that we emulate `resize` event using $broadcast method and internally subscribe to this event in each directive
            // Define event handler
            //angular.element(window).on('resize', function(e){ scope.$broadcast('resize'); });
            //scope.events = {
            //    resize: function(e, scope){
            //        $timeout(function(){
            //            console.log("scope.events.resize");
            //            // scope.api.update()
            //        },200)
            //    }
            //};

        };
    }

})(angular, smi2);
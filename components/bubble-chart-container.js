import {connect} from "react-redux";
import BubbleChart2 from "./bubble-chart/bubble-chart";
import Utils from "../common/utils";
import FieldName from "../common/constants";

const getBubbleRoot = (bubbleResponse) => {
    let root = {
        "key": "Bubbles",
        "bucketField": "root",
        "bubbles": [],
        initialized: false
    };
    bubbleResponse.data.forEach(function (d) {
        root.bubbles.push(d);
    });
    return root;
};


const mapStateToProps = (state) => {

    return {
        data: getBubbleRoot(state.bubbleResponse),
        dimensions: ["HOST"],
        options: {
            height: 1000,
            width: 1000,
            sizeMetric: "vmsWithProduct",
            colorMetric: "vmsWithProduct",
            labelField: 'hostName',
            defaultColorRange: ["#3296dc", "#d9ecf9"],
            packValue: function (d) {
                let value = d[Utils.defaultMetricName("vmsWithProduct")];
                if (value === 0) {
                    value = 0.2;
                }
                if (value === undefined)
                    value = 0.2; //When size metric field does not exist in the data
                return value;
            },
            packChildren: function (d) {
                return [];
            },
            textClasses: function (d) {
                return d.bucketField === "root" ? "hide" : "inline";
            },
            tooltip: function (d) {
                let totalVirtProcSupProdName = Utils.getI18nName(FieldName.TOTAL_VIRTUAL_PROCESSORS_SUPPORTING_PRODUCT);
                let totalVirtProcAssignForHost = Utils.getI18nName(FieldName.TOTAL_VIRT_PROCS_ASSIGNED_FOR_HOST);
                let serverDemand = Utils.getI18nName(FieldName.SERVER_DEMAND);
                let physicalCpuCoresTotal = Utils.getI18nName(FieldName.PHYSICAL_CPU_CORES_TOTAL);
                let vmsWithProduct = Utils.getI18nName(FieldName.VMS_WITH_PRODUCT);
                let vmwareSlicesAvailable = Utils.getI18nName(FieldName.VMWARE_SLICES_AVAILABLE);
                let vmwareSlicesUsed = Utils.getI18nName(FieldName.VMWARE_SLICES_USED);
                let dimName = Utils.getI18nName(v.dimension);
                let colorMetricName = Utils.getI18nName(v.colorMetric);
                let sizeMetricName = Utils.getI18nName(v.sizeMetric);
                //let $translate = $filter('translate');
                //TODO: Get translated value and populate in the following variables
                let translatedDimName = dimName;
                let translatedColorName = colorMetricName;
                let translatedSizeName = sizeMetricName;
                let translatedTotalVirtProcSupProdName = totalVirtProcSupProdName;
                let translatedTotalVirtProcAssignForHost = totalVirtProcAssignForHost;
                let translatedServerDemand = serverDemand;
                let translatedCpusPhysCores = physicalCpuCoresTotal;
                let translatedVmsWithProduct = vmsWithProduct;
                let translatedVmwareSlicesAvailable = vmwareSlicesAvailable;
                let translatedVmwareSlicesUsed = vmwareSlicesUsed;

                let texts = [
                    `<h1>HostName : ${d.hostName} </h1>`,
                    Utils.getHelpText(translatedDimName, d[v.dimension]),
                    Utils.getHelpText(translatedColorName, d[v.colorMetric]),
                    Utils.getHelpText(translatedSizeName, d[v.sizeMetric]),
                    Utils.getHelpText(translatedTotalVirtProcSupProdName, d.totalVirtualProcessorsSupportingProduct),
                    Utils.getHelpText(translatedTotalVirtProcAssignForHost, d.totalVirtProcsAssignedForHost),
                    Utils.getHelpText(translatedServerDemand, d.serverDemand),
                    Utils.getHelpText(translatedCpusPhysCores, d.physicalCpuCoresTotal),
                    Utils.getHelpText(translatedVmsWithProduct, d.vmsWithProduct),
                    Utils.getHelpText(translatedVmwareSlicesAvailable, d.vmwareSlicesAvailable),
                    Utils.getHelpText(translatedVmwareSlicesUsed, d.vmwareSlicesUsed)

                ];
                return HelptextUtils.concat(texts);
            },
            onclick: function (onClickData) {
                if (onClickData.bucketField === ConstantFields.PRODUCT) {
                    Array.prototype.forEach.call(document.querySelectorAll('.d3-tip'),
                        function (t) {
                            return t.parentNode.removeChild(t);
                        });
                    let prodGroup = onClickData.parent;
                    let vendor = prodGroup.parent;
                    let productNames = prodGroup.children.map(function (d) {
                        return d.key;
                    });

                    ProductSelectionService.setSelectedProduct(onClickData.key);
                    $state.go('dashboards.showClusters', {
                        myParams: {
                            "vendor": vendor.key,
                            "products": vendor.productGroup_terms,
                            "selected": onClickData.key
                        }
                    });
                }
            },
            registerDataLoadListener: function (onDataLoad) {
                globalFilterService.observableService.registerObserver(v.id, onDataLoad);
            },
            onBubbleClick: function (tip, data, $scope, strokeColor, invokerObj) {
                tip.hide();
                let searchRequestObj = $scope.options.requestBuilder.build();

                if ($rootScope.isSplit) {
                    let l = $scope.options.location;
                    let productName = searchRequestObj.termFilters[0].value.toString();
                    let hostName = data.hostName;
                    d3.select("#" + l + data.hostName + "circle").style("stroke", 'black');
                    d3.select("#" + l + data.hostName + "circle").style("stroke-width", '1.5');
                    let targetHosts = GlobalDashboardService.getTargetHostsForDashboard(l);
                    $scope.$emit('BUBBLE_CLICKED', hostName);
                }


            },
            valueOfPackLayout: function (d, Func, sizeMetric) {
                let overridenValue = Utils.callIfDefined(Func, d);
                return Utils.getOrElse(overridenValue, d[sizeMetric]);
            },
            fillColor: function (d, colorMetric, color, colorPercentScale, colorScale) {
                let overridenValue = Utils.callIfDefined(color, d);
                return Utils.getOrElse(overridenValue, function () {
                    /*let colorPercent = colorPercentScale(d[$scope.options.colorMetric]);*/
                    let c = (!d.isDirectlyInstalled) ? colorScale(d[colorMetric]) : "#D3D3D3";
                    return c;
                });
            }
        },
        metrics: ["vmsWithProduct"]
    }
};

const mapDispatchToProps = ({});

const BubbleChartContainer = connect(
    mapStateToProps
)(BubbleChart2);

export default BubbleChartContainer
import { Card, Form, Input, Button, notification, Radio, Select } from 'antd';
import React, { Component } from 'react';
import styles from './index.less';
import { PageContainer } from '@ant-design/pro-layout';
import {
  queryUnits,
  queryCommodityCodes,
  queryCompanies,
  queryCommonDicts,
} from '@/services/common';
import { saveCommodity, getCommodity } from '@/services/good';
import { queryCompanyProducts } from '@/services/product';
import GoodsCode from './components/GoodsCode';
import ProductList from './components/ProductList';
import { history } from 'umi';

const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 13,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 6,
    span: 16,
  },
};

const { Group } = Radio;
const { Option } = Select;

export default class GoodsEdit extends Component {
  constructor(props) {
    super(props);

    this.formRef = React.createRef();
    this.state = {
      unitList: [],
      codeSchemeList: [],
      productList: [],
      codeList: [],
      companyList: [],
      initValues: {},
      formData: {
        ratioType: 0,
        products: [],
      },
    };
  }

  async componentDidMount() {
    let unitList = [];
    let codeSchemeList = [];
    let companyList = [];
    const unitRes = await queryUnits(2);
    if (unitRes) {
      unitList = unitRes.data;
    }
    const schemeRes = await queryCommonDicts(8);
    if (schemeRes) {
      codeSchemeList = schemeRes.data[0]?.dicts ?? [];
    }

    const codeList = (await queryCommodityCodes())?.data ?? [];

    const companyRes = await queryCompanies();
    if (companyRes) {
      companyList = companyRes.data;
    }

    // const productListRes = await queryProductSelections();
    // if (productListRes) {
    //   productList = productListRes.data;
    // }

    this.listenLocation();
    this.setState({
      unitList,
      companyList,
      codeList,
      codeSchemeList,
    });
  }

  listenLocation = async () => {
    const { commodityId } = this.props.location.query;
    if (commodityId) {
      const res = await getCommodity(commodityId);
      if (res) {
        this.formRef?.current?.setFieldsValue(res.data);
        const productListRes = await queryCompanyProducts({
          manufactureId: res?.data?.manufactureId,
        });
        if (productListRes) {
          const productList = productListRes.data;
          this.setState({
            productList,
          });
        }
        this.setState({
          initValues: res.data,
          formData: res.data,
        });
      }
    }
  };

  onFinish = async (values) => {
    const { initValues } = this.state;
    const postdData = {
      ...values,
    };

    const res = await saveCommodity({ commodity: { ...Object.assign(initValues, postdData) } });
    if (res) {
      notification.success({
        description: '????????????',
        message: '??????',
      });
      this.onReset();
    }
  };

  onValuesChange = async (changedValues, all) => {
    if (changedValues.manufactureId) {
      const productListRes = await queryCompanyProducts({
        manufactureId: changedValues.manufactureId,
      });
      if (productListRes) {
        const productList = productListRes.data;
        this.setState({
          productList,
        });
      }
    }

    this.setState({
      formData: all,
    });
  };

  onReset = () => {
    this.formRef.current.resetFields();
    history.replace('/goods/management');
  };

  render() {
    const { codeSchemeList, unitList, codeList, productList, formData, companyList } = this.state;
    return (
      <PageContainer title={false}>
        <div className={styles.medicineEditContainer}>
          <div>
            <Form
              ref={this.formRef}
              onFinish={this.onFinish}
              initialValues={{
                ratioType: 0,
              }}
              onValuesChange={this.onValuesChange}
              {...layout}
              name="basic"
            >
              <Card title="????????????">
                <Form.Item
                  label="????????????"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: '?????????????????????',
                    },
                  ]}
                >
                  <Input placeholder="?????????????????????" />
                </Form.Item>

                <Form.Item
                  label="????????????"
                  name="manufactureId"
                  rules={[
                    {
                      required: true,
                      message: '?????????????????????',
                    },
                  ]}
                >
                  <Select
                    placeholder="?????????????????????"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {companyList.map((item) => (
                      <Option key={item.companyName} value={item.id}>
                        {item.companyName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="????????????" name="codes">
                  <GoodsCode codeSchemeList={codeSchemeList} codeList={codeList}></GoodsCode>
                </Form.Item>
              </Card>

              <Card title="????????????" style={{ marginTop: '30px' }}>
                <Form.Item
                  label="??????"
                  name="ratioType"
                  rules={[
                    {
                      required: true,
                      message: '???????????????',
                    },
                  ]}
                >
                  <Group disabled={formData.products ? formData.products.length < 2 : true}>
                    <Radio value={0}>?????????</Radio>
                    <Radio value={1}>???????????????</Radio>
                    <Radio value={2}>????????????</Radio>
                  </Group>
                </Form.Item>
                <Form.Item
                  label="????????????"
                  name="products"
                  rules={[
                    {
                      required: true,
                      message: '?????????????????????',
                    },
                  ]}
                >
                  <ProductList
                    unitList={unitList}
                    productList={productList}
                    ratioType={formData.ratioType}
                  ></ProductList>
                </Form.Item>
              </Card>

              <Form.Item {...tailLayout} style={{ marginTop: '30px' }}>
                <Button type="primary" htmlType="submit">
                  ??????
                </Button>
                <Button htmlType="button" className={styles.resetBtn} onClick={this.onReset}>
                  ??????
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </PageContainer>
    );
  }
}

import { PageContainer } from '@ant-design/pro-layout';
import { Card, Form, Input, Button, notification, Select } from 'antd';
import React, { Component } from 'react';
import {
  queryCommonDicts,
  getChineseMedicineTree,
  queryIndicationChildren,
} from '@/services/common';
import { saveIndicationTpl, getIndicationTpl } from '@/services/indication';
import { history } from 'umi';
import IndicationCard from '@/components/IndicationCard';

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

const { Option } = Select;

export default class TemplateEdit extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      sysList: [],
      initValues: {},
      showUnContainIndications: true,
      activeKey: null,
      indicationTree: [],
      diseaseList: [],
      symptomList: [],
      form: {
        indications: [],
      },
    };
  }

  async componentDidMount() {
    let sysList = [];
    let activeKey = null;
    let indicationTree = [];
    const { form } = this.state;
    let { diseaseList, symptomList } = this.state;
    const dictRes = await queryCommonDicts(15);
    diseaseList = (await getChineseMedicineTree({ type: 1 }))?.data ?? [];
    symptomList = (await getChineseMedicineTree({ type: 2 }))?.data ?? [];
    if (dictRes) {
      sysList = dictRes.data[0]?.dicts ?? [];
      activeKey = sysList[0].key;
      form.indications = sysList.map((item) => {
        return {
          containIndications: [],
          sysCode: item.key,
          sysName: item.value,
          unContainIndications: [],
          diseaseSymptomGroups: [],
        };
      });
    }
    const res = await queryIndicationChildren({
      sysCode: activeKey,
    });
    if (res) {
      indicationTree = res?.data?.length ? res.data : [];
    }

    this.listenLocation();

    this.setState({
      sysList,
      form,
      activeKey,
      indicationTree,
      diseaseList,
      symptomList,
    });
  }

  listenLocation = async () => {
    const { tplId } = this.props.location.query;
    if (tplId) {
      const res = await getIndicationTpl(tplId);
      if (res) {
        const { indications } = res.data;
        const form = {
          indications,
        };
        this.formRef?.current?.setFieldsValue(res.data);
        this.setState({
          initValues: res.data,
          showUnContainIndications: res.data?.isSuit,
          form,
        });
      }
    }
  };

  onTabChange = async (activeKey) => {
    let indicationTree = [];
    const res = await queryIndicationChildren({
      sysCode: activeKey,
    });
    if (res) {
      indicationTree = res?.data?.length ? res.data : [];
    }
    this.setState({
      indicationTree,
      activeKey,
    });
  };

  onloadData = async (node) => {
    const { activeKey, indicationTree } = this.state;

    const res = await queryIndicationChildren({
      sysCode: activeKey,
      parentId: node.key,
    });

    if (res?.data?.length) {
      this.setState({
        indicationTree: this.updateTreeData(indicationTree, node.key, res.data),
      });
    }
  };

  updateTreeData = (list, key, children) => {
    return list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children,
        };
      }
      if (node.children) {
        return {
          ...node,
          children: this.updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  };

  onValuesChange = (changedValues, all) => {
    this.setState({
      showUnContainIndications: all.isSuit,
    });
  };

  onFinish = async (values) => {
    const { initValues, form } = this.state;
    const postdData = {
      ...values,
      ...form,
    };

    const res = await saveIndicationTpl({
      model: { ...Object.assign(initValues, postdData) },
    });
    if (res) {
      notification.success({
        description: '????????????',
        message: '??????',
      });
      this.onReset();
    }
  };

  onReset = () => {
    this.formRef.current.resetFields();
    const form = {
      indications: [],
    };
    this.setState({ form });
    history.goBack();
  };

  onIndicationsChange = (indications) => {
    const { form } = this.state;
    form.indications = indications;
    this.setState({
      form,
    });
  };

  render() {
    const {
      sysList,
      form,
      showUnContainIndications,
      activeKey,
      indicationTree,
      diseaseList,
      symptomList,
    } = this.state;
    return (
      <PageContainer title={false}>
        <Card title="????????????">
          <Form
            ref={this.formRef}
            onFinish={this.onFinish}
            onValuesChange={this.onValuesChange}
            {...layout}
          >
            <Form.Item
              label="????????????"
              name="isSuit"
              rules={[
                {
                  required: true,
                  message: '?????????????????????',
                },
              ]}
            >
              <Select placeholder="?????????????????????">
                <Option value={true}>???????????????</Option>
                <Option value={false}>??????????????????</Option>
              </Select>
            </Form.Item>
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
              <Input placeholder="?????????????????????"></Input>
            </Form.Item>

            <IndicationCard
              diseaseList={diseaseList}
              symptomList={symptomList}
              onTabChange={this.onTabChange}
              sysList={sysList}
              activeKey={activeKey}
              indicationTree={indicationTree}
              onloadData={this.onloadData}
              indications={form.indications}
              showUnContainIndications={showUnContainIndications}
              onChange={this.onIndicationsChange}
            ></IndicationCard>

            <Form.Item {...tailLayout} style={{ marginTop: '30px' }}>
              <Button type="primary" htmlType="submit">
                ??????
              </Button>
              <Button htmlType="button" style={{ marginLeft: '8px' }} onClick={this.onReset}>
                ??????
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </PageContainer>
    );
  }
}

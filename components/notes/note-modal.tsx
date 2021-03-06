import * as React from "react";
import clsx from "clsx";
import { CategoryI, NoteDetailsProps } from "../../interfaces";

import { Dialog, Transition } from "@headlessui/react";
import { Button, Form, Input, Select } from "antd";
import {
  post_categories_create,
  post_notes_create,
  put_notes_update,
} from "../../api";
import {
  DeleteFilled,
  InboxOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export const Note_Modal: React.FC<NoteDetailsProps> = ({
  isOpen,
  hide,

  typeAction,
  titleModal,
  noteData,

  categoriesAllData,

  isArchiving,
  handler_archieve,

  isDeleting,
  handler_delete,

  refetchData,
  refetchCategories,
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>();
  // const [maxID, setMaxID] = React.useState<number>(0);

  // All options available
  const [categoriesOptions, setCategoriesOptions] = React.useState<
    React.ReactNode[]
  >([]);

  // All options selected (formated)
  const [categoriesOptionsSelected, setCategoriesOptionsSelected] =
    React.useState<number[]>([]);

  // Categories sorted to get the max value
  // const [categoriesSorted, setCategoriesSorted] = React.useState<CategoryI[]>(
  //   []
  // );

  const [form] = Form.useForm();

  // Functions
  // submit form
  const onFinish = async (values: any): Promise<void> => {
    setIsLoading(true);

    const submitData: any = {
      title: values.title,
      text: values.text,
      categories: categoriesOptionsSelected,
    };

    if (typeAction == "update" && noteData && noteData.id) {
      //   const update_response =
      await put_notes_update(noteData.id, submitData);

      //   console.log("<- Update note submit data ->", submitData);
      //   console.log("<- Update response ->", update_response);
    }

    if (typeAction == "create") {
      await post_notes_create(submitData);
    }

    await refetchData();

    console.log("<- submit data ->", submitData);

    setIsLoading(false);
    hide();
  };

  // Select category option
  const handleChangeSelect = async (values: any[]) => {
    console.log("<- Values categories, ", values);
    const selectedCategories: number[] = [];

    if (categoriesAllData) {
      values.forEach(async (item: any) => {
        // Filter all categories
        const checkCategory = categoriesAllData.filter(
          (categoryItem: CategoryI) => categoryItem.name === item
        );

        // If not null then the category already exist
        if (checkCategory.length > 0 && checkCategory[0].id) {
          selectedCategories.push(checkCategory[0].id);
          setCategoriesOptionsSelected(selectedCategories);

          // Category doesnt exist
        } else {
          // Create category
          const createCategoryresponse = await post_categories_create({
            id: 0,
            name: item,
          });

          // Refetch categories
          await refetchCategories();

          selectedCategories.push(createCategoryresponse.data.id);
          setCategoriesOptionsSelected(selectedCategories);
        }
      });
    }
  };

  // Use Effect
  // Format categories to show
  React.useEffect(() => {
    if (categoriesAllData) {
      // Format categories
      const categoriesOptions: React.ReactNode[] = [];

      categoriesAllData.forEach((categoryItem: CategoryI) => {
        if (categoryItem.id) {
          categoriesOptions.push(
            <Option key={categoryItem.name} value={categoryItem.name}>
              {categoryItem.name}
            </Option>
          );
        }
      });

      setCategoriesOptions(categoriesOptions);

      // Sort categories
      categoriesAllData.sort((a, b) => b.id - a.id);
      // setCategoriesSorted(sortcategories);
      // setMaxID(categoriesAllData[0].id);
    }
  }, [categoriesAllData]);

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto w-full h-full"
        onClose={hide}
      >
        <div className="flex justify-center w-full h-full pt-[80px]">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-20" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          {/* Transition of content */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            {/* Container of the modal */}
            <div
              className={clsx(
                "transform transition-all overflow-auto align-middle",
                "bg-white shadow-xl rounded-2xl",
                "flex flex-col",
                "w-full max-w-[1000px] p-12"
              )}
            >
              <div className="flex justify-between gap-4">
                {/* Title */}
                <h1 className="text-3xl text-gray-900 mb-8">{titleModal}</h1>

                {/* Icons */}
                {typeAction == "update" && (
                  <div className="flex gap-4 w-auto">
                    {/* Archive */}
                    {noteData && !noteData.archived && !isArchiving && (
                      <InboxOutlined
                        onClick={handler_archieve}
                        style={{ fontSize: "18px" }}
                      />
                    )}
                    {noteData && noteData.archived && !isArchiving && (
                      <UploadOutlined
                        onClick={handler_archieve}
                        style={{ fontSize: "18px" }}
                      />
                    )}
                    {isArchiving && (
                      <LoadingOutlined style={{ fontSize: "18px" }} spin />
                    )}

                    {/* Delete */}
                    {!isDeleting && (
                      <DeleteFilled
                        onClick={handler_delete}
                        style={{ fontSize: "18px" }}
                      />
                    )}

                    {isDeleting && (
                      <LoadingOutlined style={{ fontSize: "18px" }} spin />
                    )}
                  </div>
                )}
              </div>

              {/* Modal */}
              <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                autoComplete="off"
                initialValues={{
                  title: noteData?.title ?? "",
                  text: noteData?.text ?? "",
                }}
              >
                {/* Input title */}
                <Form.Item
                  label="Title"
                  name="title"
                  rules={[
                    { required: true, message: "Please write a note title!" },
                  ]}
                >
                  <Input placeholder="Enter the title of the note" />
                </Form.Item>

                {/* Input Text */}
                <Form.Item
                  label="Content"
                  name="text"
                  rules={[
                    {
                      required: true,
                      message: "Please the content of the note!",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter the note description"
                  />
                </Form.Item>

                <Form.Item label="Categories" name="categories">
                  <Select
                    mode="tags"
                    style={{ width: "100%" }}
                    onChange={handleChangeSelect}
                    tokenSeparators={[","]}
                  >
                    {categoriesOptions}
                  </Select>
                </Form.Item>

                {/* Button */}
                <div className="flex flex-wrap justify-center gap-6 w-full">
                  {/* Cancel */}
                  <Form.Item className="w-auto">
                    <Button
                      type="primary"
                      danger
                      loading={isLoading}
                      onClick={hide}
                      className=""
                    >
                      Cancel
                    </Button>
                  </Form.Item>

                  {/* Submit */}
                  <Form.Item className="w-auto">
                    <Button
                      htmlType="submit"
                      type="primary"
                      loading={isLoading}
                      className=""
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Note_Modal;

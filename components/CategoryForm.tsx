import React, { useState, ChangeEvent, FormEvent } from 'react';

interface CategoryFormProps {
  icon: string;
  name: string;
  borderColor: string;
  sortValues: string[];
  onSave: (data: {icon: string, name: string, borderColor: string, sortValues: string[]}) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ icon, name, borderColor, sortValues, onSave }) => {
  const [formState, setFormState] = useState({ icon, name, borderColor, sortValues });

		const clearForm = () => {
			setFormState({ icon: "", name: "", borderColor: "", sortValues: [] });
		}

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setFormState({
        ...formState,
        [event.target.name]: event.target.value,
      });
    };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow-md">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
          Icon
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="icon"
          type="text"
          name="icon"
          value={formState.icon}
          onChange={handleChange}
        />
      </div>
      {/* Add similar input fields for name, borderColor, and sortValues */}
      <div className="flex items-center justify-between">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Save
        </button>
				<button onClick={clearForm} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;



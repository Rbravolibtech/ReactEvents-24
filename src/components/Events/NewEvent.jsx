import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent } from "../../Utility/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";


import { queryClient } from "../../Utility/http.js"

export default function NewEvent() {
	const navigate = useNavigate();

	const { mutate, isPending, isError, error } = useMutation({
		mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["events"]})
      navigate("/events")
    }
	});

	function handleSubmit(formData) {
		mutate({ event: formData });
   
	}

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && "submitting..."}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="FAILED TO CREATE EVENT"
          message={
            error.info?.message ||
            'FAILED TO CREATE EVENT. PLEASE CHECK YOUR INPUTS AND TRY AGAIN LATER'
          }
        />
      )}
    </Modal>
  );
}
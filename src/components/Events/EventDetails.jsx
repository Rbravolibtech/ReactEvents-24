import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from "@tanstack/react-query"

import Header from '../Header.jsx';
import { fetchEvent, deleteEvent, queryClient } from "../../Utility/http.js"
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from "react"
import Modal from "../UI/Modal.jsx"

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false)

  const params = useParams()
  const navigate = useNavigate()

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none"
      })
      navigate("/events")
    }
  })

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id })
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-detail-content" className='center'>
        <p>FETCHING EVENT DATA...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-detail-content" className='center'>
        <ErrorBlock
          title="failed to load event"
          message={
            error.info?.message ||
            'failed to fetch event data, please try again later.'
          }
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>

        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`To-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>ARE YOU SURE?</h2>
          <p>DO YOUR REALLY WANT TO DELETE THIS EVENT, THIS CAN NOT BE UNDONE.</p>
          <div className='form-actions'>
            {isPendingDeletion && <p>DELETING, PLEASE WAIT...</p>}
            {isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className="button-text">CANCEL</button>
                <button onClick={handleDelete} className="button">DELETE</button>
              </>
            )}
          </div>

          {isErrorDeleting && <ErrorBlock title="failed to delete" message={deleteError.info.message || 'failed to delete event, please try again later'} />}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details"> {content} </article>
    </>
  );
}
